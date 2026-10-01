import OpenAI from "openai";
import type { AIAnalysisResponse, DetectedInputType, RiskSeverity } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are SecureFlow AI — an expert, multi-domain security analysis engine.

You accept ANY security-relevant input and automatically detect what it is. Your job is to:
1. Identify the input type with precision
2. Apply the correct security lens for that domain
3. Find real, specific vulnerabilities and risks
4. Return structured findings with actionable remediation

You handle all of these input types (and more):
- Source code (Python, JavaScript, Go, Java, PHP, Ruby, C/C++, SQL, etc.)
- Infrastructure as Code (Terraform, Pulumi, CloudFormation, ARM templates)
- Container configurations (Dockerfile, docker-compose, Kubernetes YAML)
- IAM / access policies (AWS IAM, GCP IAM, Azure RBAC, OPA policies)
- Network configurations (firewall rules, iptables, nginx/Apache config, VPN config)
- API specifications (OpenAPI/Swagger, GraphQL schemas, gRPC proto files)
- Logs (HTTP access logs, auth logs, application logs, security events)
- Environment/config files (.env, app.yaml, settings.json, etc.)
- CI/CD pipelines (GitHub Actions, GitLab CI, Jenkinsfile, CircleCI)
- Security policies and compliance documents
- API responses and HTTP traffic samples
- Database queries and schemas

You MUST respond with valid JSON only — no markdown fences, no text outside the JSON object.

Analysis principles:
- Be specific: identify the EXACT vulnerable line, field, or pattern
- Be technical: use proper security terminology
- Be actionable: give concrete fixes, not generic advice
- Be calibrated: only flag real risks, avoid false positives
- Reference standards (CWE, OWASP, MITRE ATT&CK, NIST, CIS) where applicable`;

// ── User prompt builder ──────────────────────────────────────────────────────

function buildPrompt(content: string): string {
  return `Analyze the following input for security vulnerabilities, misconfigurations, and risks.

INPUT:
\`\`\`
${content}
\`\`\`

First, identify what this input is. Then perform a thorough security analysis.

Return ONLY this JSON structure (no markdown, no code fences):
{
  "detected_type": "<one of: source_code|terraform|kubernetes|dockerfile|iam_policy|network_config|firewall_rules|api_spec|http_logs|system_logs|security_incident|api_response|security_policy|database_query|ci_cd_pipeline|environment_config|unknown>",
  "detected_type_label": "<human-readable label, e.g. 'Terraform / Cloud Infrastructure', 'Python Source Code', 'AWS IAM Policy'>",
  "summary": "<2-3 sentence executive summary of the security posture of this input>",
  "risk_score": <integer 0-100>,
  "overall_severity": "<critical|high|medium|low|info>",
  "findings": [
    {
      "title": "<short, specific finding title>",
      "description": "<detailed explanation of the vulnerability: what it is, why it's dangerous, what an attacker could do>",
      "severity": "<critical|high|medium|low|info>",
      "category": "<primary domain: e.g. Cloud Security, Injection, Authentication, Cryptography, Access Control, Container Security, Network Security, Secrets Management, Supply Chain>",
      "subcategory": "<specific category: e.g. Storage Access Control, SQL Injection, Hardcoded Credentials, Privilege Escalation>",
      "framework_refs": ["<e.g. CWE-284, OWASP A01:2021, NIST AC-3, CIS AWS 2.1.5, MITRE T1078>"],
      "cvss": <number 0.0-10.0 or null>,
      "location": "<where in the input: 'Line 12', 'Field: acl', 'Block: aws_s3_bucket.data', or null>",
      "recommendation": "<specific, implementable fix — include code examples where helpful>"
    }
  ],
  "recommended_actions": [
    "<prioritized cross-cutting action 1 — most critical first>",
    "<action 2>",
    "<action 3>"
  ]
}

Rules:
- findings: 1–10 items, ordered by severity (critical first)
- recommended_actions: 3–7 items, ordered by priority
- If input has no meaningful security concerns, risk_score ≤ 5, overall_severity = "info"
- framework_refs should include the most applicable standards — don't invent references
- cvss: use CVSS 3.1 base score or null if not applicable
- location: be specific — quote the field name, line number, or block name from the input`;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const VALID_SEVERITIES: RiskSeverity[] = ["critical", "high", "medium", "low", "info"];
const VALID_TYPES: DetectedInputType[] = [
  "source_code", "terraform", "kubernetes", "dockerfile", "iam_policy",
  "network_config", "firewall_rules", "api_spec", "http_logs", "system_logs",
  "security_incident", "api_response", "security_policy", "database_query",
  "ci_cd_pipeline", "environment_config", "unknown",
];

function sanitizeSeverity(v: unknown): RiskSeverity {
  return VALID_SEVERITIES.includes(v as RiskSeverity) ? (v as RiskSeverity) : "info";
}

function sanitizeType(v: unknown): DetectedInputType {
  return VALID_TYPES.includes(v as DetectedInputType) ? (v as DetectedInputType) : "unknown";
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function runSecurityAnalysis(content: string): Promise<AIAnalysisResponse> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildPrompt(content) },
    ],
    temperature: 0.15,   // Low temperature = consistent, precise analysis
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty response from AI engine");

  const parsed = JSON.parse(raw) as AIAnalysisResponse;

  if (!Array.isArray(parsed.findings)) {
    throw new Error("Invalid AI response: findings must be an array");
  }

  // Sanitize and enrich findings
  const findings = parsed.findings.map((f, i) => ({
    ...f,
    id: `finding-${Date.now()}-${i}`,
    severity: sanitizeSeverity(f.severity),
    framework_refs: Array.isArray(f.framework_refs) ? f.framework_refs : [],
    cvss: f.cvss !== null && f.cvss !== undefined ? Math.max(0, Math.min(10, Number(f.cvss))) : undefined,
    category: f.category || "Security",
    subcategory: f.subcategory || "",
  }));

  return {
    detected_type: sanitizeType(parsed.detected_type),
    detected_type_label: parsed.detected_type_label || "Unknown Input Type",
    summary: parsed.summary || "Analysis complete.",
    risk_score: Math.max(0, Math.min(100, Number(parsed.risk_score) || 0)),
    overall_severity: sanitizeSeverity(parsed.overall_severity),
    findings,
    recommended_actions: Array.isArray(parsed.recommended_actions)
      ? parsed.recommended_actions
      : [],
  };
}
