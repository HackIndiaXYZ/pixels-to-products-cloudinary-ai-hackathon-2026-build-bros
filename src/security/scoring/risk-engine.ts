import { RuleEvaluationResult, Severity } from "../types";

export function calculateRiskScore(findings: RuleEvaluationResult[]): { score: number; level: Severity } {
  let score = 0;
  
  // Calculate total score based on findings' severity mapping
  const severityScores: Record<Severity, number> = {
    CRITICAL: 50,
    HIGH: 35,
    MEDIUM: 20,
    LOW: 10
  };
  
  for (const finding of findings) {
    score += severityScores[finding.severity] || 0;
  }
  
  // Cap score at 100
  if (score > 100) score = 100;
  
  // Determine level
  let level: Severity = "LOW";
  if (score >= 75) level = "CRITICAL";
  else if (score >= 50) level = "HIGH";
  else if (score >= 25) level = "MEDIUM";
  
  return { score, level };
}
