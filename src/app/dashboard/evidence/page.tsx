import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FileWarning, Search, Filter } from "lucide-react";
import Link from "next/link";
import { EvidenceList } from "./EvidenceList";

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
    <div className="max-w-[1400px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-[--color-rule-light] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[--color-ink] tracking-tight mb-2">Media Library</h1>
          <p className="text-sm font-semibold text-[--color-ink-3]">Your complete media intelligence workspace.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/analysis/new" className="px-4 py-2 bg-[--color-ink] text-white rounded-lg text-xs font-bold shadow-sm hover:bg-[--color-primary] transition-colors">
            + Upload Media
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-[--color-rule-light] shadow-sm">
        <div className="relative flex-1 w-full max-w-xl">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[--color-ink-4]" />
          <form method="GET" action="/dashboard/search">
            <input 
              type="text" 
              name="q"
              placeholder="Search media..." 
              className="w-full pl-9 pr-4 py-2 bg-[--color-surface-2] border border-[--color-rule-light] rounded-lg focus:border-[--color-ink-3] outline-none text-sm font-bold"
            />
          </form>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white border border-[--color-rule-light] rounded-lg text-xs font-bold text-[--color-ink-3] hover:text-[--color-ink] hover:bg-[--color-surface-2] flex items-center gap-2 transition-all">
             Filter <span className="opacity-50">▾</span>
           </button>
           <button className="px-4 py-2 bg-white border border-[--color-rule-light] rounded-lg text-xs font-bold text-[--color-ink-3] hover:text-[--color-ink] hover:bg-[--color-surface-2] flex items-center gap-2 transition-all">
             Sort <span className="opacity-50">▾</span>
           </button>
        </div>
      </div>

      {!analyses || analyses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-[--color-rule]">
          <FileWarning className="w-8 h-8 text-[--color-ink-4] mb-4" />
          <h3 className="font-editorial text-lg text-[--color-ink] mb-2">No evidence found</h3>
          <p className="font-editorial text-sm text-[--color-ink-3] mb-6">You haven&apos;t analyzed any security evidence yet.</p>
          <Link href="/dashboard/analysis/new" className="font-technical text-xs uppercase tracking-wider bg-[--color-ink] text-[--color-surface] px-6 py-3 hover:bg-[--color-ink-2] transition-colors">
            Analyze New Evidence
          </Link>
        </div>
      ) : (
        <EvidenceList analyses={analyses} />
      )}
    </div>
  );
}
