import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { runSecurityEngine } from "@/lib/ai/security-engine";
import { ALL_RULES } from "@/security/rules";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createAdminClient();

    // Fetch the existing analysis + evidence
    const { data: analysis, error: fetchErr } = await supabase
      .from("analyses")
      .select(`*, evidence (*)`)
      .eq("id", id)
      .single();

    if (fetchErr || !analysis) {
      return NextResponse.json(
        { error: "Evidence record not found." },
        { status: 404 }
      );
    }

    const evidence = Array.isArray(analysis.evidence)
      ? analysis.evidence[0]
      : analysis.evidence;

    // Re-run the engine with what we know
    const engineResult = await runSecurityEngine({
      assetId: evidence?.cloudinary_asset_id || id,
      publicId: evidence?.public_id || "",
      resourceType: (evidence?.resource_type as "image" | "video" | "raw" | "auto") || "image",
      cloudinaryIntelligence: {},
      format: evidence?.format,
      filename: evidence?.public_id?.split("/").pop(),
    });

    const analysisData = engineResult.data;

    // Update the analysis record
    const { error: updateErr } = await supabase
      .from("analyses")
      .update({
        risk_score: analysisData.risk_score,
        overall_severity: analysisData.overall_severity,
        risk_status: analysisData.risk_status,
        analysis_confidence: analysisData.analysis_confidence,
        model: analysisData.model,
        analysis_status: "completed",
        executive_summary: analysisData.executive_summary,
      })
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Delete old sub-records and re-insert
    await supabase.from("observations").delete().eq("analysis_id", id);
    await supabase.from("risks").delete().eq("analysis_id", id);
    await supabase.from("recommendations").delete().eq("analysis_id", id);

    if (analysisData.observations?.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from("observations").insert(analysisData.observations.map((o: any) => ({
        analysis_id: id,
        statement: o.statement,
        evidence_source: o.evidence_source,
        confidence: o.confidence,
      })));
    }

    if (analysisData.potential_risks?.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from("risks").insert(analysisData.potential_risks.map((r: any) => ({
        analysis_id: id,
        title: r.title,
        severity: r.severity,
        category: r.category,
        statement: r.statement,
        evidence: r.evidence,
        confidence: r.confidence,
        is_inferred: r.is_inferred,
      })));
    }

    if (analysisData.recommendations?.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from("recommendations").insert(analysisData.recommendations.map((r: any) => ({
        analysis_id: id,
        priority: r.priority,
        action: r.action,
        rationale: r.rationale,
      })));
    }

    const rulesEvaluated = ALL_RULES.filter((r) => r.enabled).map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      severity: r.severity,
      description: `Evaluates ${r.category} risks in the provided context.`,
    }));

    return NextResponse.json({
      success: true,
      analysis: analysisData,
      provider: engineResult.provider,
      rulesEvaluated,
      ruleCount: ALL_RULES.filter((r) => r.enabled).length,
    });
  } catch (err) {
    console.error("Re-run rules error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
