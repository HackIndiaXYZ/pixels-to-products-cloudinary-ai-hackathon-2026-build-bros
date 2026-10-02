import { createClient } from "@/lib/supabase/server";
import { Search, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { EvidenceList } from "./EvidenceList";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/states/EmptyState";

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
    <PageContainer>
      <PageHeader 
        category="MEDIA"
        title="Media Library"
        description="Your complete media intelligence workspace."
        primaryAction={
          <Link href="/dashboard/workspace" className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-[12px] text-xs font-medium shadow-sm hover:bg-gray-800 transition-all hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98]">
            <ImageIcon className="w-3.5 h-3.5" />
            Upload Media
          </Link>
        }
      />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/70 backdrop-blur-md p-2 rounded-[16px] border border-gray-200/60 shadow-[0_2px_8px_rgba(15,23,42,0.02)] mb-8">
        <div className="relative flex-1 w-full max-w-xl">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <form method="GET" action="/dashboard/search">
            <input 
              type="text" 
              name="q"
              placeholder="Search media..." 
              className="w-full pl-9 pr-4 py-2 bg-transparent border-none focus:ring-0 outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
            />
          </form>
        </div>
        <div className="flex gap-2 px-2">
           <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-[10px] text-[11px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-sm transition-all active:scale-[0.98]">
             Filter <span className="opacity-50 ml-1">▾</span>
           </button>
           <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-[10px] text-[11px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-sm transition-all active:scale-[0.98]">
             Sort <span className="opacity-50 ml-1">▾</span>
           </button>
        </div>
      </div>

      {!analyses || analyses.length === 0 ? (
        <EmptyState 
          icon={<ImageIcon className="w-6 h-6" />}
          title="No media assets yet"
          description="Upload your first image to begin analyzing, transforming, and optimizing media."
          primaryAction={
            <Link href="/dashboard/workspace" className="px-5 py-2.5 bg-gray-900 text-white rounded-[12px] text-xs font-medium shadow-sm hover:bg-gray-800 transition-all hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98]">
              Upload Media
            </Link>
          }
        />
      ) : (
        <EvidenceList analyses={analyses} />
      )}
    </PageContainer>
  );
}
