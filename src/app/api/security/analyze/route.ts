import { NextResponse } from "next/server";
import { runSecurityEngine, OpenAIUnavailableError } from "@/lib/ai/security-engine";
import { createClient, createAdminClient, ConfigurationError } from "@/lib/supabase/server";

// Structured error response shape used by the frontend to render accurate UI
function structuredError(
  stage: string,
  code: string,
  message: string,
  retryable: boolean,
  httpStatus = 500,
  extra?: Record<string, unknown>
) {
  return NextResponse.json(
    { success: false, stage, code, error: message, retryable, ...extra },
    { status: httpStatus }
  );
}

/** Build a Supabase client, trying admin first then anon. */
async function getSupabaseClient() {
  return await createAdminClient();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { evidence, cloudinaryIntelligence, userContext } = body;

    if (!evidence?.publicId || !evidence?.assetId) {
      return structuredError(
        "input_validation",
        "MISSING_EVIDENCE_IDENTIFIERS",
        "Missing required evidence identifiers (publicId / assetId).",
        false,
        400
      );
    }

    // ── Stage 1: Security Reasoning Engine ────────────────────────────────────
    let engineResult;
    try {
      engineResult = await runSecurityEngine({
        assetId: evidence.assetId,
        publicId: evidence.publicId,
        resourceType: evidence.resourceType,
        cloudinaryIntelligence: cloudinaryIntelligence || {},
        userContext,
        format: evidence.format,
        filename: evidence.fileName,
      });
    } catch (engineErr) {
      const msg = engineErr instanceof Error ? engineErr.message : String(engineErr);
      return structuredError(
        "security_analysis",
        "ENGINE_ERROR",
        `Security engine failed: ${msg}`,
        false
      );
    }

    const analysisData = engineResult.data;

    // ── Stage 2: Supabase Persistence ─────────────────────────────────────────
    let supabase;
    try {
      supabase = await getSupabaseClient();
    } catch (configErr) {
      if (configErr instanceof Error && configErr.message === "SUPABASE_CONFIG_MISSING") {
        return structuredError(
          "evidence_persistence",
          "SUPABASE_CONFIG_MISSING",
          "Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
          false
        );
      }
      if (configErr instanceof ConfigurationError) {
        return structuredError(configErr.stage, configErr.code, configErr.message, configErr.retryable);
      }
      throw configErr;
    }

    let analysisId: string | null = null;

    // Persist evidence record
    const { data: evData, error: evError } = await supabase
      .from("evidence")
      .insert({
        cloudinary_asset_id: evidence.assetId,
        public_id: evidence.publicId,
        secure_url: evidence.secureUrl,
        resource_type: evidence.resourceType,
        format: evidence.format,
        width: evidence.width,
        height: evidence.height,
        bytes: evidence.bytes,
      })
      .select("id")
      .single();

    if (evError) {
      return structuredError(
        "evidence_persistence",
        "DATABASE_WRITE_ERROR",
        `Failed to persist evidence: ${evError.message}`,
        true
      );
    }

    // Persist analysis record
    const { data: anData, error: anError } = await supabase
      .from("analyses")
      .insert({
        evidence_id: evData.id,
        detected_evidence_type: analysisData.detected_evidence_type,
        executive_summary: analysisData.executive_summary,
        risk_score: analysisData.risk_score,
        overall_severity: analysisData.overall_severity,
        risk_status: analysisData.risk_status,
        analysis_confidence: analysisData.analysis_confidence,
        model: analysisData.model,
        analysis_status: "completed",
      })
      .select("id")
      .single();

    if (anError) {
      return structuredError(
        "analysis_persistence",
        "DATABASE_WRITE_ERROR",
        `Failed to persist analysis: ${anError.message}`,
        true
      );
    }
    analysisId = anData.id;

    // Persist observations
    if (analysisData.observations?.length) {
      const obsPayload = analysisData.observations.map(
        (o: { statement: string; evidence_source: string; confidence: number }) => ({
          analysis_id: analysisId,
          statement: o.statement,
          evidence_source: o.evidence_source,
          confidence: o.confidence,
        })
      );
      const { error: obsErr } = await supabase.from("observations").insert(obsPayload);
      if (obsErr) console.warn("Observations persist warning:", obsErr.message);
    }

    // Persist risks
    if (analysisData.potential_risks?.length) {
      const risksPayload = analysisData.potential_risks.map(
        (r: { title: string; severity: string; category: string; statement: string; evidence: string[]; confidence: number; is_inferred: boolean }) => ({
          analysis_id: analysisId,
          title: r.title,
          severity: r.severity,
          category: r.category,
          statement: r.statement,
          evidence: r.evidence,
          confidence: r.confidence,
          is_inferred: r.is_inferred,
        })
      );
      const { error: riskErr } = await supabase.from("risks").insert(risksPayload);
      if (riskErr) console.warn("Risks persist warning:", riskErr.message);
    }

    // Persist recommendations
    if (analysisData.recommendations?.length) {
      const recsPayload = analysisData.recommendations.map(
        (r: { priority: string; action: string; rationale: string }) => ({
          analysis_id: analysisId,
          priority: r.priority,
          action: r.action,
          rationale: r.rationale,
        })
      );
      const { error: recErr } = await supabase.from("recommendations").insert(recsPayload);
      if (recErr) console.warn("Recommendations persist warning:", recErr.message);
    }

    return NextResponse.json({
      success: true,
      analysis: analysisData,
      analysisId,
      provider: engineResult.provider,
      aiAvailability: engineResult.aiAvailability,
      aiNote: engineResult.aiNote,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Security analysis unhandled error:", error);
    return NextResponse.json(
      {
        success: false,
        stage: "unknown",
        code: "INTERNAL_ERROR",
        error: msg || "An unexpected error occurred during security analysis.",
        retryable: false,
      },
      { status: 500 }
    );
  }
}
