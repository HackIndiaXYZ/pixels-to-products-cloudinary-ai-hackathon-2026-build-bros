import { SecurityRule, RuleContext } from "../types";
import { PATTERNS } from "../patterns";

export const credentialRules: SecurityRule[] = [
  {
    id: "SEC-CRED-001",
    name: "Credential Keyword Exposure",
    category: "credentials",
    severity: "HIGH",
    enabled: true,
    score: 40,
    evaluate: (context: RuleContext) => {
      const text = (context.extractedText || "").toUpperCase();
      const filename = (context.filename || "").toUpperCase();
      const tags = (context.tags || []).map(t => t.toUpperCase());
      
      const keywords = ["API_KEY", "SECRET", "PASSWORD", "PRIVATE KEY", "CREDENTIAL"];
      const matched = keywords.find(k => text.includes(k) || filename.includes(k) || tags.includes(k));
      
      if (matched) {
        return {
          ruleId: "SEC-CRED-001",
          ruleName: "Credential Keyword Exposure",
          severity: "HIGH",
          reason: `Found keyword suggesting credentials: ${matched}`,
          evidence: "Text or metadata contains credential-related keywords",
          recommendation: "Review the asset and revoke exposed credentials immediately."
        };
      }
      return null;
    }
  },
  {
    id: "SEC-CRED-002",
    name: "Potential AWS Credential Exposure",
    category: "credentials",
    severity: "CRITICAL",
    enabled: true,
    score: 50,
    evaluate: (context: RuleContext) => {
      const text = context.extractedText || "";
      if (PATTERNS.AWS_ACCESS_KEY.test(text)) {
        return {
          ruleId: "SEC-CRED-002",
          ruleName: "Potential AWS Credential Exposure",
          severity: "CRITICAL",
          reason: "Regex matched an AWS-style access key.",
          evidence: "Extracted text contains a string resembling an AWS access key.",
          recommendation: "Rotate the potentially exposed AWS access key immediately."
        };
      }
      return null;
    }
  },
  {
    id: "SEC-CRED-003",
    name: "Private Key Exposure",
    category: "credentials",
    severity: "CRITICAL",
    enabled: true,
    score: 50,
    evaluate: (context: RuleContext) => {
      const text = context.extractedText || "";
      if (PATTERNS.PRIVATE_KEY.test(text)) {
        return {
          ruleId: "SEC-CRED-003",
          ruleName: "Private Key Exposure",
          severity: "CRITICAL",
          reason: "Regex matched a private key header.",
          evidence: "Extracted text contains a private key format.",
          recommendation: "Revoke and regenerate the compromised private key."
        };
      }
      return null;
    }
  },
  {
    id: "SEC-SECRET-001",
    name: "Token/Secret Exposure",
    category: "secrets",
    severity: "HIGH",
    enabled: true,
    score: 40,
    evaluate: (context: RuleContext) => {
      const text = context.extractedText || "";
      if (PATTERNS.JWT.test(text)) {
        return {
          ruleId: "SEC-SECRET-001",
          ruleName: "Token/Secret Exposure",
          severity: "HIGH",
          reason: "Detected a JSON Web Token (JWT).",
          evidence: "Extracted text matches JWT format.",
          recommendation: "Invalidate the exposed token."
        };
      }
      if (PATTERNS.GENERIC_API_KEY.test(text)) {
        return {
          ruleId: "SEC-SECRET-001",
          ruleName: "Token/Secret Exposure",
          severity: "HIGH",
          reason: "Detected a generic API key assignment.",
          evidence: "Extracted text matches generic API key assignment.",
          recommendation: "Rotate the exposed secret."
        };
      }
      return null;
    }
  }
];
