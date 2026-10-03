import { createAdminClient as createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Search, Archive } from "lucide-react";
import type { AnalysisResult } from "@/types";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/states/EmptyState";

export const metadata = { title: "Archive - SecureFlow AI" };

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const query = (await searchParams).q as string || "";

  let supabaseQuery = supabase
    .from("analyses")
    .select("*")
    .eq('is_archived', true)
    .order("created_at", { ascending: false });

  if (query) {
    supabaseQuery = supabaseQuery.ilike("title", `%${query}%`);
  }

  const { data: analyses } = await supabaseQuery;
  const list = (analyses ?? []) as AnalysisResult[];

  return (
    <PageContainer>
      <PageHeader 
        category="INTELLIGENCE"
        title="Evidence Archive"
        description="Historical security reports that have been explicitly archived."
      />

      {/* Search Bar */}
      <div className="bg-white/70 backdrop-blur-sm p-2 rounded-[16px] border border-gray-200/60 shadow-[0_2px_8px_rgba(15,23,42,0.02)] mb-8">
        <form action="/dashboard/archive" method="GET" className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search archived reports..."
            className="w-full bg-transparent border-none focus:ring-0 outline-none pl-9 pr-4 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-400"
          />
        </form>
      </div>

      <div className="mb-4">
        <p className="font-ui text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
          {list.length.toString().padStart(2, '0')} ARCHIVED ITEMS {query && `MATCHING "${query}"`}
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.02)] overflow-hidden">
        {list.length === 0 ? (
          <EmptyState 
            icon={<Archive className="w-6 h-6" />}
            title="Archive is empty"
            description={query ? "Adjust your search to see results." : "No reports have been archived yet."}
          />
        ) : (
          <div>
            <div className="grid grid-cols-12 px-6 py-4 border-b border-gray-200/60 bg-gray-50/50 font-ui text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              <div className="col-span-2">DATE</div>
              <div className="col-span-4">EVIDENCE</div>
              <div className="col-span-3">ENGINE</div>
              <div className="col-span-3">STATUS</div>
            </div>

            <div className="divide-y divide-gray-200/60">
              {list.map((report) => (
                <div key={report.id} className="grid grid-cols-12 px-6 py-4 hover:bg-gray-50/50 transition-colors items-center group">
                  <div className="col-span-2 font-ui text-[11px] font-semibold text-gray-500 uppercase">
                    {new Date(report.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    }).toUpperCase()}
                  </div>
                  <div className="col-span-4 pr-4 font-editorial text-sm font-medium text-gray-900 truncate">
                    {report.title}
                  </div>
                  <div className="col-span-3 font-ui text-[11px] font-semibold text-gray-500 uppercase">
                    OPENAI
                  </div>
                  <div className="col-span-3 flex justify-between items-center font-ui text-[11px] font-semibold uppercase">
                    <span className="text-gray-400 line-through">
                      {report.overall_severity || "LIMITED"}
                    </span>
                    <Link
                      href={`/dashboard/evidence/${report.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98]"
                    >
                      OPEN ARCHIVE
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
