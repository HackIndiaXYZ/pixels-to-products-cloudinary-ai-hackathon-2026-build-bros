import { createAdminClient as createClient } from "@/lib/supabase/server";
import { Search as SearchIcon, Filter, FileWarning } from "lucide-react";
import Link from "next/link";
import { EvidenceList } from "../evidence/EvidenceList";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/states/EmptyState";
import { SearchClient } from "@/components/search/SearchClient";

export const metadata = {
  title: "Search - SecureFlow AI",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q || "";
  const supabase = await createClient();

  // Fetch analyses matching the query
  let supabaseQuery = supabase
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

  if (query) {
    supabaseQuery = supabaseQuery.ilike('detected_evidence_type', `%${query}%`);
  }

  const { data: analyses, error } = await supabaseQuery;

  if (error) {
    console.error("Failed to fetch search results:", error);
  }

  return <SearchClient initialAnalyses={analyses || []} initialQuery={query} />;
}
