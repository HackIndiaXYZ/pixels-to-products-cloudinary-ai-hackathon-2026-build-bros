import { SecurityRule, RuleContext } from "../types";
import { PATTERNS } from "../patterns";

export const infrastructureRules: SecurityRule[] = [
  {
    id: "SEC-INFRA-001",
    name: "Sensitive Infrastructure Exposure",
    category: "infrastructure",
    severity: "HIGH",
    enabled: true,
    score: 25,
    evaluate: (context: RuleContext) => {
      const tags = (context.tags || []).map(t => t.toLowerCase());
      const infraKeywords = ["server", "datacenter", "network", "router", "firewall", "terminal", "database", "code", "programming"];
      
      const matched = infraKeywords.find(k => tags.includes(k));
      if (matched) {
        return {
          ruleId: "SEC-INFRA-001",
          ruleName: "Sensitive Infrastructure Exposure",
          severity: "HIGH",
          reason: `Asset categorized as sensitive infrastructure (${matched}).`,
          evidence: `Cloudinary tag: ${matched}`,
          recommendation: "Ensure infrastructure visuals do not leak IP addresses or network topology."
        };
      }
      
      const text = context.extractedText || "";
      if (PATTERNS.IP_ADDRESS.test(text)) {
        return {
          ruleId: "SEC-INFRA-001",
          ruleName: "Sensitive Infrastructure Exposure",
          severity: "HIGH",
          reason: "Found IP Address in text.",
          evidence: "Extracted text contains an IP Address.",
          recommendation: "Mask internal IP addresses before sharing."
        };
      }
      
      return null;
    }
  }
];
