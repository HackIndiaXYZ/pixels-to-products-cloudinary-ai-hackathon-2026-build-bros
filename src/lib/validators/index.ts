import { z } from "zod";

// ── Analysis input ────────────────────────────────────────────────────────────
// No input_type — the AI auto-detects what the content is

export const analysisInputSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title is too long (max 120 characters)"),
  input_content: z
    .string()
    .min(10, "Please provide at least 10 characters to analyze")
    .max(50000, "Input is too large — maximum 50,000 characters"),
});

export type AnalysisInput = z.infer<typeof analysisInputSchema>;

// ── Auth ──────────────────────────────────────────────────────────────────────

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signUpSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Must contain uppercase, lowercase, and a number"
      ),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
