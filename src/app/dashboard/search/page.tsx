import { createClient } from "@/lib/supabase/server";
import { Search as SearchIcon, Filter, FileWarning } from "lucide-react";
import Link from "next/link";
import { EvidenceList } from "../evidence/EvidenceList";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/states/EmptyState";

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
    <PageContainer>
      <PageHeader 
        category="SEARCH"
        title="Smart Media Search"
        description={query ? `Showing results for "${query}"` : "Search all media, reports, and evidence"}
        primaryAction={
          <Link href="/dashboard/pipeline" className="text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-[10px] flex items-center gap-1 font-medium transition-colors shadow-sm hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98]">
             Back to Pipeline
          </Link>
        }
      />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white/70 backdrop-blur-sm p-2 rounded-[16px] border border-gray-200/60 shadow-[0_2px_8px_rgba(15,23,42,0.02)]">
        <div className="relative flex-1 w-full max-w-xl">
          <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <form method="GET" action="/dashboard/search">
            <input 
              type="text" 
              name="q"
              defaultValue={query}
              placeholder="Search evidence (e.g. 'Laptop', 'Person')..." 
              className="w-full pl-9 pr-4 py-2 bg-transparent border-none focus:ring-0 outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
            />
          </form>
        </div>
        <div className="flex gap-2 px-2">
           <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-[10px] text-[11px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-sm transition-all active:scale-[0.98] flex items-center gap-1">
             <Filter className="w-3.5 h-3.5" /> TYPE: ALL
           </button>
           <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-[10px] text-[11px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-sm transition-all active:scale-[0.98]">
             MODERATION: ALL
           </button>
        </div>
      </div>

      {!analyses || analyses.length === 0 ? (
        <EmptyState 
          icon={<FileWarning className="w-6 h-6" />}
          title="No results found"
          description={`We couldn't find any media matching "${query}".`}
          primaryAction={
            <Link href="/dashboard/pipeline" className="px-5 py-2.5 bg-gray-900 text-white rounded-[12px] text-xs font-medium shadow-sm hover:bg-gray-800 transition-all hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98]">
              Return to Pipeline
            </Link>
          }
        />
      ) : (
        <EvidenceList analyses={analyses} />
      )}
    </PageContainer>
  );
}
