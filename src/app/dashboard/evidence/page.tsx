import { createAdminClient as createClient } from "@/lib/supabase/server";
import { EvidenceLibraryClient } from "@/components/evidence/EvidenceLibraryClient";

export const metadata = {
  title: "Evidence Library - SecureFlow AI",
};

export default async function EvidenceLibraryPage() {
  const supabase = await createClient();

  // Fetch analyses along with their associated evidence
  const { data: analyses, error } = await supabase
    .from("analyses")
    .select(`
      id,
      detected_evidence_type,
      risk_score,
      overall_severity,
      created_at,
      evidence (
        public_id,
        secure_url,
        format
      )
    `)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Failed to fetch evidence:", error);
  }

  return (
    <EvidenceLibraryClient analyses={analyses || []} />
  );
}
