import { createClient } from "@/lib/supabase/server";
import { Search as SearchIcon, Filter, FileWarning } from "lucide-react";
import Link from "next/link";
import { EvidenceList } from "../evidence/EvidenceList";

export const metadata = {
  title: "Search - SecureFlow AI",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";
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

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-[--color-ink] tracking-tight">Smart Media Search</h1>
            <span className="text-[10px] font-bold text-[--color-healthy] bg-[--color-healthy]/10 px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1 border border-[--color-healthy]/20">
              <span className="w-1.5 h-1.5 bg-[--color-healthy] rounded-full"></span>
              Universal
            </span>
          </div>
          <p className="text-sm text-[--color-ink-3] font-medium">
            {query ? `Showing results for "${query}"` : "Search all media, reports, and evidence"}
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/dashboard/pipeline" className="text-xs font-bold text-[--color-primary] hover:underline flex items-center gap-1">
             BACK TO PIPELINE
           </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-xl border border-[--color-rule-light]">
        <div className="relative flex-1 w-full max-w-xl">
          <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[--color-ink-4]" />
          <form method="GET" action="/dashboard/search">
            <input 
              type="text" 
              name="q"
              defaultValue={query}
              placeholder="Search evidence (e.g. 'Laptop', 'Person')..." 
              className="w-full pl-9 pr-4 py-2 bg-[--color-surface-2] border border-[--color-rule] rounded-lg focus:border-[--color-ink-3] outline-none text-sm font-bold"
            />
          </form>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white border border-[--color-rule-light] rounded-lg text-xs font-bold text-[--color-ink-3] hover:text-[--color-ink] hover:bg-[--color-surface-2] flex items-center gap-2 shadow-sm transition-all">
             <Filter className="w-3.5 h-3.5" /> TYPE: ALL
           </button>
           <button className="px-4 py-2 bg-white border border-[--color-rule-light] rounded-lg text-xs font-bold text-[--color-ink-3] hover:text-[--color-ink] hover:bg-[--color-surface-2] flex items-center gap-2 shadow-sm transition-all">
             MODERATION: ALL
           </button>
        </div>
      </div>

      {!analyses || analyses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-[--color-rule-light] rounded-2xl bg-white">
          <FileWarning className="w-8 h-8 text-[--color-ink-4] mb-4" />
          <h3 className="text-lg font-bold text-[--color-ink] mb-2">No results found</h3>
          <p className="text-sm font-semibold text-[--color-ink-3] mb-6">We couldn&apos;t find any media matching "{query}".</p>
          <Link href="/dashboard/pipeline" className="text-xs uppercase font-bold tracking-widest bg-[--color-ink] text-white px-6 py-3 rounded-full hover:bg-[--color-primary] transition-colors">
            Return to Pipeline
          </Link>
        </div>
      ) : (
        <EvidenceList analyses={analyses} />
      )}
    </div>
  );
}
