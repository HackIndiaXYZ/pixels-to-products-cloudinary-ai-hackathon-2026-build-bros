import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { runSecurityAnalysis } from "@/lib/ai/engine";
import { analysisInputSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAdminClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse & validate body
    const body = await request.json();
    const validation = analysisInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { title, input_content } = validation.data;

    // Create pending analysis record
    const { data: analysis, error: insertError } = await supabase
      .from("analyses")
      .insert({
        user_id: user.id,
        title,
        input_content,
        status: "analyzing",
      })
      .select()
      .single();

    if (insertError || !analysis) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create analysis record" },
        { status: 500 }
      );
    }

    // Run AI analysis — single input, auto-detects type
    const aiResult = await runSecurityAnalysis(input_content);

    // Persist results
    const { data: updated, error: updateError } = await supabase
      .from("analyses")
      .update({
        status: "completed",
        detected_type: aiResult.detected_type,
        detected_type_label: aiResult.detected_type_label,
        findings: aiResult.findings,
        summary: aiResult.summary,
        risk_score: aiResult.risk_score,
        overall_severity: aiResult.overall_severity,
        recommended_actions: aiResult.recommended_actions,
        completed_at: new Date().toISOString(),
      })
      .eq("id", analysis.id)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to save analysis results" },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysis: updated }, { status: 200 });
  } catch (error) {
    console.error("Analysis API error:", error);

    // Surface AI errors more clearly in development
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
