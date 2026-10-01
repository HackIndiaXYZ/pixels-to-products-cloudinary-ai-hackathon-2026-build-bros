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
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[--color-rule-light] pb-6">
        <div>
          <h1 className="font-editorial text-3xl text-[--color-ink] mb-2">Evidence Library</h1>
          <p className="font-editorial text-sm text-[--color-ink-3]">Historical security reports and analyzed media assets.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[--color-ink-4]" />
            <input 
              type="text" 
              placeholder="Search evidence..." 
              className="pl-9 pr-4 py-2 bg-[--color-surface-2] border border-[--color-rule] focus:border-[--color-ink-3] outline-none font-editorial text-sm w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-[--color-rule] hover:bg-[--color-surface-2] transition-colors font-technical text-xs uppercase text-[--color-ink-2]">
            <Filter className="w-3 h-3" />
            Filter
          </button>
          <Link href="/dashboard/archive" className="flex items-center gap-2 px-3 py-2 border border-[--color-rule] hover:bg-[--color-surface-2] transition-colors font-technical text-xs uppercase text-[--color-ink-2]">
            Archive
          </Link>
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
