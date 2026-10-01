export type RiskSeverity = "critical" | "high" | "medium" | "low" | "info";

export type AnalysisStatus = "pending" | "analyzing" | "completed" | "failed";

// Auto-detected input types — user never selects this manually
export type DetectedInputType =
  | "source_code"
  | "terraform"
  | "kubernetes"
  | "dockerfile"
  | "iam_policy"
  | "network_config"
  | "firewall_rules"
  | "api_spec"
  | "http_logs"
  | "system_logs"
  | "security_incident"
  | "api_response"
  | "security_policy"
  | "database_query"
  | "ci_cd_pipeline"
  | "environment_config"
  | "unknown";

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: RiskSeverity;
  // Flexible multi-domain categorization
  category: string;          // e.g. "Cloud Security", "Injection", "Cryptography"
  subcategory: string;       // e.g. "Storage Access Control", "SQL Injection"
  framework_refs: string[];  // e.g. ["CWE-284", "OWASP A01", "NIST AC-3"]
  cvss?: number;             // CVSS 3.1 base score 0–10
  location?: string;         // "Line 12", "Field: acl", "Header: X-Powered-By"
  recommendation: string;    // Specific, actionable fix
}

export interface AnalysisResult {
  id: string;
  user_id: string;
  title: string;
  // What the AI detected the input to be
  detected_type: DetectedInputType;
  detected_type_label: string; // Human-readable: "Terraform / Cloud Infrastructure"
  input_content: string;
  status: AnalysisStatus;
  findings: Finding[];
  summary: string;
  risk_score: number;          // 0–100
  overall_severity: RiskSeverity;
  recommended_actions: string[];
  created_at: string;
  completed_at?: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface AnalysisFormData {
  title: string;
  input_content: string;
}

export interface AIAnalysisResponse {
  detected_type: DetectedInputType;
  detected_type_label: string;
  summary: string;
  risk_score: number;
  overall_severity: RiskSeverity;
  findings: Omit<Finding, "id">[];
  recommended_actions: string[];
}
