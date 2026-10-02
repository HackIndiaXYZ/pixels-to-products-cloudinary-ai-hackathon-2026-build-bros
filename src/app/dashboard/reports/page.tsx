import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import type { AnalysisResult } from "@/types";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata = { title: "Reports - SecureFlow AI" };

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const query = (await searchParams).q as string || "";

  let supabaseQuery = supabase
    .from("analyses")
    .select("*")
    .order("created_at", { ascending: false });

  if (query) {
    supabaseQuery = supabaseQuery.ilike("title", `%${query}%`);
  }

  const { data: analyses } = await supabaseQuery;
  const list = (analyses ?? []) as AnalysisResult[];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-[--color-rule-light] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[--color-ink] tracking-tight mb-2">Security Reports</h1>
          <p className="text-sm font-semibold text-[--color-ink-3]">Archive of all completed media intelligence and security assessments.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[--color-rule-light] shadow-sm mb-8">
        <form action="/dashboard/reports" method="GET" className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-ink-3]" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search reports by title..."
            className="w-full bg-[--color-surface-2] border border-[--color-rule-light] rounded-lg pl-9 pr-4 py-2 text-sm font-bold text-[--color-ink] placeholder:text-[--color-ink-4] focus:outline-none focus:border-[--color-ink-3] transition-colors"
          />
        </form>
      </div>

      <div className="mb-4">
        <p className="text-xs font-bold tracking-widest text-[--color-ink] uppercase">
          {list.length} REPORTS {query && `MATCHING "${query}"`}
        </p>
      </div>

      <div className="bg-white border border-[--color-rule-light] rounded-2xl shadow-sm overflow-hidden">
        {list.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-[--color-ink-3]">No reports found.</p>
          </div>
        ) : (
          <div>
            {/* Table Header */}
            <div className="grid grid-cols-12 px-6 py-4 border-b border-[--color-rule-light] bg-[--color-surface-2] text-xs font-bold tracking-widest text-[--color-ink-4] uppercase">
              <div className="col-span-2">DATE</div>
              <div className="col-span-5">EVIDENCE</div>
              <div className="col-span-2">ENGINE</div>
              <div className="col-span-3">STATUS</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[--color-rule-light]">
              {list.map((report) => (
                <div key={report.id} className="grid grid-cols-12 px-6 py-4 hover:bg-[--color-surface-2] transition-colors items-center group">
                  <div className="col-span-2 text-xs font-bold text-[--color-ink-3] uppercase">
                    {new Date(report.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short"
                    }).toUpperCase()}
                  </div>
                  <div className="col-span-5 pr-4 text-sm font-bold text-[--color-ink] truncate">
                    {report.title}
                  </div>
                  <div className="col-span-2 text-xs font-bold text-[--color-ink-3] uppercase">
                    OPENAI
                  </div>
                  <div className="col-span-3 flex justify-between items-center text-xs font-bold uppercase">
                    <span className="text-[--color-ink]">
                      {report.overall_severity || "LIMITED"}
                    </span>
                    <Link
                      href={`/dashboard/evidence/${report.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[--color-ink] hover:text-[--color-primary] bg-white border border-[--color-rule-light] px-3 py-1.5 rounded-lg shadow-sm"
                    >
                      OPEN
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
