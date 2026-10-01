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
    <div className="px-8 lg:px-12 pt-8 pb-24 max-w-[1400px] mx-auto w-full">
      <Breadcrumbs items={[
        { label: "INTELLIGENCE" },
        { label: "REPORTS" }
      ]} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-[--color-rule] pb-6">
        <div>
          <h1 className="font-editorial text-3xl tracking-wide uppercase text-[--color-ink] mb-3">
            Security Reports
          </h1>
          <p className="font-ui text-sm text-[--color-ink-2] leading-relaxed">
            Archive of all completed media intelligence and security assessments.
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 text-right">
          <div className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-1">
            ARCHIVE STORAGE
          </div>
          <div className="font-technical text-sm text-[--color-ink]">
            READ-ONLY VAULT
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8 max-w-xl relative">
        <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-2">SEARCH</p>
        <form action="/dashboard/reports" method="GET" className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-ink-3]" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search reports by title..."
            className="w-full bg-[--color-surface] border border-[--color-rule] pl-12 pr-4 py-3 font-technical text-sm text-[--color-ink] placeholder:text-[--color-ink-4] focus:outline-none focus:border-[--color-ink] transition-colors"
          />
        </form>
      </div>

      <div className="mb-4">
        <p className="font-technical text-[10px] tracking-widest text-[--color-ink] uppercase">
          {list.length.toString().padStart(2, '0')} REPORTS {query && `MATCHING "${query}"`}
        </p>
      </div>

      <div className="border border-[--color-rule] bg-[--color-surface]">
        {list.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-editorial text-lg text-[--color-ink-3] italic">No reports found.</p>
          </div>
        ) : (
          <div>
            {/* Table Header */}
            <div className="grid grid-cols-12 px-6 py-4 border-b border-[--color-rule-strong] bg-[--color-surface-2] font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase">
              <div className="col-span-2">DATE</div>
              <div className="col-span-4">EVIDENCE</div>
              <div className="col-span-3">ENGINE</div>
              <div className="col-span-3">STATUS</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[--color-rule-light]">
              {list.map((report) => (
                <div key={report.id} className="grid grid-cols-12 px-6 py-4 hover:bg-[--color-surface-2] transition-colors items-center group">
                  <div className="col-span-2 font-technical text-xs text-[--color-ink-3] uppercase">
                    {new Date(report.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short"
                    }).toUpperCase()}
                  </div>
                  <div className="col-span-4 pr-4 font-technical text-sm text-[--color-ink] truncate">
                    {report.title}
                  </div>
                  <div className="col-span-3 font-technical text-xs text-[--color-ink-3] uppercase">
                    OPENAI
                  </div>
                  <div className="col-span-3 flex justify-between items-center font-technical text-xs uppercase">
                    <span className="text-[--color-ink]">
                      {report.overall_severity || "LIMITED"}
                    </span>
                    <Link
                      href={`/dashboard/evidence/${report.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[--color-ink] border border-[--color-rule-strong] px-3 py-1 bg-[--color-background]"
                    >
                      OPEN REPORT
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
