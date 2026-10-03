import { createAdminClient as createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, FileWarning } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { AnalysisResult } from "@/types";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/states/EmptyState";

export const metadata = { title: "History" };

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("analyses")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const analyses = (data ?? []) as AnalysisResult[];

  return (
    <PageContainer>
      <PageHeader 
        category="INTELLIGENCE"
        title="Analysis History"
        description="Historical log of all security evaluations performed by your account."
        primaryAction={
          <Link href="/dashboard/analysis/new" className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-[12px] text-xs font-medium shadow-sm hover:bg-gray-800 transition-all hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98]">
            New Analysis <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      {/* Count */}
      {analyses.length > 0 && (
        <p className="font-ui text-[10px] font-semibold tracking-wider text-gray-500 uppercase mb-4">
          {analyses.length} {analyses.length === 1 ? "ANALYSIS" : "ANALYSES"} TOTAL
        </p>
      )}

      <div className="bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.02)] overflow-hidden">
        {analyses.length === 0 ? (
          <EmptyState 
            icon={<FileWarning className="w-6 h-6" />}
            title="No analyses yet"
            description="Upload any media to get started with AI processing."
            primaryAction={
              <Link href="/dashboard/workspace" className="px-5 py-2.5 bg-gray-900 text-white rounded-[12px] text-xs font-medium shadow-sm hover:bg-gray-800 transition-all hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98]">
                Run first analysis
              </Link>
            }
          />
        ) : (
          <div>
            {/* Table header */}
            <div className="grid grid-cols-12 px-6 py-4 border-b border-gray-200/60 bg-gray-50/50 font-ui text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            {[
              { label: "DATE",          span: "col-span-2" },
              { label: "TITLE",         span: "col-span-4" },
              { label: "DETECTED TYPE", span: "col-span-3" },
              { label: "RISK",          span: "col-span-1" },
              { label: "FINDINGS",      span: "col-span-1" },
              { label: "STATUS",        span: "col-span-1" },
            ].map((h) => (
              <p key={h.label} className={`eyebrow ${h.span}`}>{h.label}</p>
            ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-200/60">
              {analyses.map((a) => (
                <Link key={a.id} href={`/dashboard/evidence/${a.id}`}>
                  <div className="grid grid-cols-12 px-6 py-4 items-center transition-colors hover:bg-gray-50/50 group">
                    {/* Date */}
                    <p className="col-span-2 font-ui text-[11px] font-semibold text-gray-500 uppercase">
                      {formatDate(a.created_at)}
                    </p>

                    {/* Title */}
                    <div className="col-span-4 pr-4">
                      <p className="font-editorial text-sm font-medium text-gray-900 truncate">
                        {a.title}
                      </p>
                    </div>

                    {/* Detected type */}
                    <p className="col-span-3 font-ui text-[11px] font-semibold text-gray-500 truncate pr-4">
                      {a.detected_type_label ?? "—"}
                    </p>

                    {/* Risk */}
                    <div className="col-span-1">
                      {a.risk_score !== null && a.risk_score !== undefined ? (
                        <span className="font-editorial text-lg" style={{ color: `var(--color-${a.overall_severity || 'medium'})` }}>
                          {a.risk_score}
                        </span>
                      ) : (
                        <span className="font-ui text-[11px] font-semibold text-gray-400">—</span>
                      )}
                    </div>

                    {/* Findings count */}
                    <p className="col-span-1 font-ui text-[11px] font-semibold text-gray-500">
                      {Array.isArray(a.findings) ? a.findings.length : "—"}
                    </p>

                    {/* Status */}
                    <div className="col-span-1">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md border ${
                        a.status === "completed" ? "bg-gray-50 border-gray-200 text-gray-600" : "bg-blue-50 text-blue-600 border-blue-100"
                      }`}>
                        {a.status === "completed" && a.overall_severity ? a.overall_severity.toUpperCase() : a.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
