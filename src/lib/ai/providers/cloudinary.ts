import { EnginePayload } from "../security-engine";
import { SecurityAnalysisResult } from "../schemas";

export function runCloudinaryProvider(payload: EnginePayload): SecurityAnalysisResult {
  const { cloudinaryIntelligence, resourceType } = payload;
  
  const tags = (cloudinaryIntelligence.tags as string[]) || [];
  const moderation = cloudinaryIntelligence.moderation as string | undefined;

  const observations = tags.map((t, idx) => ({
    id: `obs-cld-${idx}`,
    statement: `Detected element: ${t}`,
    evidence_source: "cloudinary_ai" as const,
    confidence: 80
  }));

  if (moderation && moderation !== "pending" && moderation !== "approved") {
    observations.push({
      id: `obs-cld-mod`,
      statement: `Moderation flagged: ${moderation}`,
      evidence_source: "cloudinary_ai",
      confidence: 100
    });
  }

  const potential_risks = [];
  const securityKeywords = ["password", "key", "token", "secret", "credential", "credit card", "ssn", "malware", "phishing"];
  const foundRisks = tags.filter(t => securityKeywords.some(k => t.toLowerCase().includes(k)));
  
  let risk_score = 10;
  let overall_severity: "info" | "low" | "medium" | "high" | "critical" = "info";

  if (foundRisks.length > 0) {
    risk_score = 60;
    overall_severity = "high";
    potential_risks.push({
      id: "risk-cld-1",
      title: "Sensitive Content Detected",
      severity: "high" as const,
      category: "Data Exposure",
      statement: `Cloudinary AI Vision detected potentially sensitive keywords: ${foundRisks.join(", ")}`,
      evidence: foundRisks,
      confidence: 70,
      is_inferred: true as const
    });
  }

  return {
    detected_evidence_type: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} Asset`,
    executive_summary: "Analysis generated using Cloudinary AI add-ons. Multimodal LLM reasoning was skipped or unavailable.",
    risk_score,
    risk_status: "investigating",
    analysis_confidence: "high",
    model: "cloudinary-ai",
    overall_severity,
    observations,
    potential_risks,
    recommendations: foundRisks.length > 0 ? [
      {
        priority: "high",
        action: "Review asset for sensitive data exposure",
        rationale: "Cloudinary automatically flagged tags that often correlate with sensitive data."
      }
    ] : []
  };
}
