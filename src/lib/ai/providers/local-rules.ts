import { EnginePayload } from "../security-engine";
import { SecurityAnalysisResult } from "../schemas";

export function runLocalRulesProvider(payload: EnginePayload): SecurityAnalysisResult {
  const { resourceType, cloudinaryIntelligence } = payload;
  const cldIntel = cloudinaryIntelligence || {};
  const metadata = (cldIntel.metadata as Record<string, string>) || {};
  const format = metadata.format || "unknown";
  
  const observations = [
    {
      id: "obs-loc-1",
      statement: `Resource type: ${resourceType}`,
      evidence_source: "metadata" as const,
      confidence: 100
    },
    {
      id: "obs-loc-2",
      statement: `Format: ${format}`,
      evidence_source: "metadata" as const,
      confidence: 100
    }
  ];

  if (metadata.width && metadata.height) {
    observations.push({
      id: "obs-loc-3",
      statement: `Dimensions: ${metadata.width}x${metadata.height}`,
      evidence_source: "metadata",
      confidence: 100
    });
  }
  
  const diagnostics = (cldIntel.diagnostics as Record<string, string>) || {};
  if (diagnostics.vision === "ADDON_REQUIRED") {
    observations.push({
      id: "obs-loc-4",
      statement: "Cloudinary AI Vision: unavailable",
      evidence_source: "metadata",
      confidence: 100
    });
  }

  return {
    detected_evidence_type: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} File`,
    executive_summary: "No machine-readable security indicators were returned by the configured Cloudinary intelligence services. Analysis capability limited due to lack of multimodal provider.",
    risk_score: null,
    risk_status: "insufficient_evidence",
    analysis_confidence: "limited",
    model: "local-rules",
    overall_severity: "info",
    observations,
    potential_risks: [],
    recommendations: []
  };
}
