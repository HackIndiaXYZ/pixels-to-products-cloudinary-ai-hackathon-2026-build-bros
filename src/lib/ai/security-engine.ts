import { SecureFlowEngine } from "../../security/engine";
import { SecurityAnalysisResult } from "./schemas";
import { RuleContext } from "../../security/types";

export interface EnginePayload {
  assetId: string;
  publicId: string;
  resourceType: "image" | "video" | "raw" | "auto";
  cloudinaryIntelligence: Record<string, unknown> | null;
  userContext?: string;
  format?: string;
  filename?: string;
}

export type AnalysisProvider = "openai" | "rule-engine" | "local-rules";
export type ProviderAvailability = "available" | "not_configured" | "unavailable";

export interface EngineResult {
  success: boolean;
  data: SecurityAnalysisResult;
  provider: AnalysisProvider;
  aiAvailability: ProviderAvailability;
  aiNote?: string;
}

export class OpenAIUnavailableError extends Error {
  constructor(
    public readonly code: "RATE_LIMITED" | "NO_CREDITS" | "AUTH_ERROR" | "API_ERROR",
    public readonly original: unknown
  ) {
    const msg = original instanceof Error ? original.message : String(original);
    super(msg);
    this.name = "OpenAIUnavailableError";
  }
}

export async function runSecurityEngine(payload: EnginePayload): Promise<EngineResult> {
  // We can eventually add OpenAI back as an optional enhancer here.
  // For now, it delegates entirely to the SecureFlow Rule Engine.
  
  const engine = new SecureFlowEngine();
  
  // Extract text from Cloudinary OCR if present
  let extractedText = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cldIntel = payload.cloudinaryIntelligence as any;
  if (cldIntel?.info?.ocr?.adv_ocr?.data) {
    const textData = cldIntel.info.ocr.adv_ocr.data;
    if (Array.isArray(textData)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      extractedText = textData.map((d: any) => d.textAnnotations?.[0]?.description || "").join(" ");
    }
  }

  const context: RuleContext = {
    metadata: (payload.cloudinaryIntelligence as Record<string, unknown>) || {},
    tags: (cldIntel?.tags as string[]) || [],
    moderation: (cldIntel?.moderation as string) || "pending",
    extractedText,
    resourceType: payload.resourceType,
    format: payload.format,
    filename: payload.filename
  };

  const engineResult = engine.evaluate(context);
  
  // Transform to legacy schema for UI compatibility
  const mapSeverity = (sev: string): "critical" | "high" | "medium" | "low" | "info" => {
    const s = sev.toLowerCase();
    if (["critical", "high", "medium", "low", "info"].includes(s)) {
      return s as "critical" | "high" | "medium" | "low" | "info";
    }
    return "info";
  };

  const mapPriority = (sev: string): "immediate" | "high" | "medium" | "low" => {
    const s = sev.toLowerCase();
    if (s === "critical") return "immediate";
    if (["high", "medium", "low"].includes(s)) {
      return s as "high" | "medium" | "low";
    }
    return "low";
  };

  const analysisData: SecurityAnalysisResult = {
    detected_evidence_type: "Media Asset",
    executive_summary: `SecureFlow Engine completed analysis with a risk score of ${engineResult.riskScore}.`,
    risk_score: engineResult.riskScore,
    overall_severity: mapSeverity(engineResult.riskLevel),
    risk_status: engineResult.riskScore > 24 ? "requires_attention" : "clear",
    analysis_confidence: "100", // Deterministic engine has 100% confidence in its own rules
    model: "SecureFlow Rule Engine v1",
    observations: [],
    potential_risks: engineResult.findings.map(f => ({
      id: `risk_${Math.random().toString(36).substring(7)}`,
      title: f.ruleName,
      severity: mapSeverity(f.severity),
      category: f.ruleId,
      statement: f.reason,
      evidence: [f.evidence],
      confidence: 100,
      is_inferred: true
    })),
    recommendations: engineResult.findings.map(f => ({
      priority: mapPriority(f.severity),
      action: f.recommendation,
      rationale: `Triggered by rule ${f.ruleId}`
    }))
  };

  // Add dummy observation if empty, just so the UI has something to show
  if (analysisData.observations.length === 0) {
    analysisData.observations.push({
      id: "obs_default",
      statement: "Asset ingested and evaluated against active rules.",
      evidence_source: "metadata",
      confidence: 100
    });
  }

  return {
    success: true,
    data: analysisData,
    provider: "rule-engine",
    aiAvailability: "not_configured",
    aiNote: "Security analysis performed by deterministic SecureFlow Rule Engine."
  };
}
