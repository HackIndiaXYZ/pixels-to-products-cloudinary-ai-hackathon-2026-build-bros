import { SecurityRule, RuleContext } from "../types";
import { PATTERNS } from "../patterns";

export const piiRules: SecurityRule[] = [
  {
    id: "SEC-PII-001",
    name: "Potential PII Exposure",
    category: "privacy",
    severity: "MEDIUM",
    enabled: true,
    score: 25,
    evaluate: (context: RuleContext) => {
      const text = context.extractedText || "";
      if (PATTERNS.EMAIL.test(text) || PATTERNS.PHONE.test(text)) {
        return {
          ruleId: "SEC-PII-001",
          ruleName: "Potential PII Exposure",
          severity: "MEDIUM",
          reason: "Detected email address or phone number.",
          evidence: "Extracted text contains contact information.",
          recommendation: "Ensure PII is redacted if this asset is public."
        };
      }
      return null;
    }
  }
];
