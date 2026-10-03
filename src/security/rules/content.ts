import { SecurityRule, RuleContext } from "../types";

export const contentRules: SecurityRule[] = [
  {
    id: "SEC-MAL-001",
    name: "Potential Malware Indicator",
    category: "malware",
    severity: "CRITICAL",
    enabled: true,
    score: 50,
    evaluate: (context: RuleContext) => {
      const tags = (context.tags || []).map(t => t.toLowerCase());
      const malwareKeywords = ["malware", "virus", "ransomware", "trojan", "exploit"];
      
      const matched = malwareKeywords.find(k => tags.includes(k));
      if (matched) {
        return {
          ruleId: "SEC-MAL-001",
          ruleName: "Potential Malware Indicator",
          severity: "CRITICAL",
          reason: `Detected malware-related indicator: ${matched}.`,
          evidence: `Cloudinary tag: ${matched}`,
          recommendation: "Quarantine asset and run a full antivirus scan."
        };
      }
      return null;
    }
  },
  {
    id: "SEC-SUSP-001",
    name: "Suspicious Content",
    category: "content",
    severity: "HIGH",
    enabled: true,
    score: 30,
    evaluate: (context: RuleContext) => {
      // Use Cloudinary moderation result if available
      const moderation = context.moderation || "pending";
      if (moderation !== "pending" && moderation !== "approved" && moderation !== "ok") {
        return {
          ruleId: "SEC-SUSP-001",
          ruleName: "Suspicious Content",
          severity: "HIGH",
          reason: `Asset moderation returned status: ${moderation}.`,
          evidence: `Cloudinary Moderation API result: ${moderation}`,
          recommendation: "Review the asset manually for policy violations."
        };
      }
      
      const tags = (context.tags || []).map(t => t.toLowerCase());
      const suspKeywords = ["hacker", "breach", "leak", "dump", "darkweb"];
      
      const matched = suspKeywords.find(k => tags.includes(k));
      if (matched) {
        return {
          ruleId: "SEC-SUSP-001",
          ruleName: "Suspicious Content",
          severity: "HIGH",
          reason: `Detected suspicious content tag: ${matched}.`,
          evidence: `Cloudinary tag: ${matched}`,
          recommendation: "Determine context of the suspicious content."
        };
      }
      
      return null;
    }
  }
];
