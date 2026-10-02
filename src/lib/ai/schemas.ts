import { z } from "zod";

export const SecurityAnalysisResultSchema = z.object({
  executive_summary: z.string(),
  detected_evidence_type: z.string(),
  observations: z.array(z.object({
    id: z.string(),
    statement: z.string(),
    evidence_source: z.enum(["visual", "cloudinary_ai", "metadata"]),
    confidence: z.number()
  })),
  potential_risks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    severity: z.enum(["critical", "high", "medium", "low", "info"]),
    category: z.string(),
    statement: z.string(),
    evidence: z.array(z.string()),
    confidence: z.number(),
    is_inferred: z.literal(true)
  })),
  recommendations: z.array(z.object({
    priority: z.enum(["immediate", "high", "medium", "low"]),
    action: z.string(),
    rationale: z.string()
  })),
  risk_score: z.number().nullable(),
  risk_status: z.string().nullable(),
  analysis_confidence: z.string().nullable(),
  overall_severity: z.enum(["critical", "high", "medium", "low", "info"]),
  model: z.string().nullable()
});

export type SecurityAnalysisResult = z.infer<typeof SecurityAnalysisResultSchema>;
