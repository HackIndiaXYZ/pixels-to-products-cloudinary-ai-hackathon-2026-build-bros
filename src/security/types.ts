export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface SecurityRule {
  id: string;
  name: string;
  category: "credentials" | "privacy" | "infrastructure" | "malware" | "content" | "secrets";
  severity: Severity;
  enabled: boolean;
  score: number;
  evaluate: (context: RuleContext) => RuleEvaluationResult | null;
}

export interface RuleContext {
  metadata?: Record<string, unknown>;
  tags?: string[];
  moderation?: string;
  extractedText?: string;
  resourceType?: string;
  format?: string;
  filename?: string;
}

export interface RuleEvaluationResult {
  ruleId: string;
  ruleName: string;
  severity: Severity;
  reason: string;
  evidence: string;
  recommendation: string;
}

export interface SecurityEngineResult {
  findings: RuleEvaluationResult[];
  riskScore: number;
  riskLevel: Severity;
  triggeredRules: string[];
}
