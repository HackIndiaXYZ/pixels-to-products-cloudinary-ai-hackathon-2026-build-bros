import { NextResponse } from "next/server";
import { runSecurityEngine } from "@/lib/ai/security-engine";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { evidence, cloudinaryIntelligence, userContext } = body;

    if (!evidence?.publicId || !evidence?.assetId) {
      return NextResponse.json(
        { success: false, error: "Missing required evidence identifiers" },
        { status: 400 }
      );
    }

    // 1. Run the Security Reasoning Engine (which handles fallbacks internally)
    const result = await runSecurityEngine({
      assetId: evidence.assetId,
      publicId: evidence.publicId,
      resourceType: evidence.resourceType,
      cloudinaryIntelligence: cloudinaryIntelligence || {},
      userContext
    });

    const analysisData = result.data;

    // 2. Supabase Persistence
    const supabase = await createAdminClient();

    let analysisId: string | null = null;

    // Persist evidence
    const { data: evData, error: evError } = await supabase.from('evidence').insert({
        cloudinary_asset_id: evidence.assetId,
        public_id: evidence.publicId,
        secure_url: evidence.secureUrl,
        resource_type: evidence.resourceType,
        format: evidence.format,
        width: evidence.width,
        height: evidence.height,
        bytes: evidence.bytes
      }).select('id').single();

      if (evError) throw new Error("Failed to persist evidence: " + evError.message);
      
      // Persist analysis
      const { data: anData, error: anError } = await supabase.from('analyses').insert({
        evidence_id: evData.id,
        detected_evidence_type: analysisData.detected_evidence_type,
        executive_summary: analysisData.executive_summary,
        risk_score: analysisData.risk_score,
        overall_severity: analysisData.overall_severity,
        risk_status: analysisData.risk_status,
        analysis_confidence: analysisData.analysis_confidence,
        model: analysisData.model,
        analysis_status: 'completed'
      }).select('id').single();

      if (anError) throw new Error("Failed to persist analysis: " + anError.message);
      analysisId = anData.id;

      // Persist observations
      if (analysisData.observations?.length) {
        const obsPayload = analysisData.observations.map((o: { statement: string, evidence_source: string, confidence: number }) => ({
          analysis_id: analysisId,
          statement: o.statement,
          evidence_source: o.evidence_source,
          confidence: o.confidence
        }));
        await supabase.from('observations').insert(obsPayload);
      }

      // Persist risks
      if (analysisData.potential_risks?.length) {
        const risksPayload = analysisData.potential_risks.map((r: { title: string, severity: string, category: string, statement: string, evidence: string[], confidence: number, is_inferred: boolean }) => ({
          analysis_id: analysisId,
          title: r.title,
          severity: r.severity,
          category: r.category,
          statement: r.statement,
          evidence: r.evidence,
          confidence: r.confidence,
          is_inferred: r.is_inferred
        }));
        await supabase.from('risks').insert(risksPayload);
      }

      // Persist recommendations
      if (analysisData.recommendations?.length) {
        const recsPayload = analysisData.recommendations.map((r: { priority: string, action: string, rationale: string }) => ({
          analysis_id: analysisId,
          priority: r.priority,
          action: r.action,
          rationale: r.rationale
        }));
        await supabase.from('recommendations').insert(recsPayload);
      }

    return NextResponse.json({
      success: true,
      analysis: analysisData,
      analysisId
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Security analysis error:", error);
    return NextResponse.json(
      { success: false, error: msg || "Failed to process security reasoning" },
      { status: 500 }
    );
  }
}
