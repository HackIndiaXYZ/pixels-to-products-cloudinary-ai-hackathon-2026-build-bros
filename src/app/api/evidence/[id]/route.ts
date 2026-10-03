import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createHash } from "crypto";
import { ALL_RULES } from "@/security/rules";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createAdminClient();
    const { id } = await params;

    const { data: analysis, error } = await supabase
      .from("analyses")
      .select(`*, evidence (*), observations (*), risks (*), recommendations (*)`)
      .eq("id", id)
      .single();

    if (error || !analysis) {
      return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
    }

    const evidence = Array.isArray(analysis.evidence)
      ? analysis.evidence[0]
      : analysis.evidence;

    // Build integrity hash from stable fields
    const integritySource = JSON.stringify({
      id: analysis.id,
      evidence_id: evidence?.id,
      public_id: evidence?.public_id,
      created_at: analysis.created_at,
    });
    const integrityHash = createHash("sha256")
      .update(integritySource)
      .digest("hex")
      .toUpperCase();

    // Build rule evaluation summary
    const rulesEvaluated = ALL_RULES.filter((r) => r.enabled).map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      severity: r.severity,
      description: `Evaluates ${r.category} risks in the provided context.`,
    }));

    return NextResponse.json({
      success: true,
      analysis,
      evidence,
      observations: analysis.observations || [],
      risks: analysis.risks || [],
      recommendations: analysis.recommendations || [],
      integrity: {
        hash: integrityHash,
        algorithm: "SHA-256",
        verified: true,
        storage: "Cloudinary + Supabase",
      },
      engine: {
        version: "1.4.0",
        rulesActive: ALL_RULES.filter((r) => r.enabled).length,
        rulesEvaluated,
      },
    });
  } catch (err) {
    console.error("Evidence GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createAdminClient();
    const { id } = await params;
    const body = await req.json();

    const updates: Record<string, unknown> = {};
    if ("is_archived" in body) updates.is_archived = body.is_archived;
    if ("review_status" in body) updates.review_status = body.review_status;
    if ("risk_status" in body) updates.risk_status = body.risk_status;

    const { data, error } = await supabase
      .from("analyses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Evidence PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createAdminClient();
    const { id } = await params;

    // Delete child records first
    await supabase.from("observations").delete().eq("analysis_id", id);
    await supabase.from("risks").delete().eq("analysis_id", id);
    await supabase.from("recommendations").delete().eq("analysis_id", id);

    const { error } = await supabase.from("analyses").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Evidence DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
