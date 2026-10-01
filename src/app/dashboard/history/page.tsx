import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { AnalysisResult } from "@/types";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";

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
    <div className="px-8 lg:px-12 pt-8 pb-24 max-w-[1400px] mx-auto w-full">
      <Breadcrumbs items={[
        { label: "INTELLIGENCE" },
        { label: "HISTORY" }
      ]} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-[--color-rule] pb-6">
        <div>
          <h1 className="font-editorial text-3xl tracking-wide uppercase text-[--color-ink] mb-3">
            All Analyses
          </h1>
          <p className="font-ui text-sm text-[--color-ink-2] leading-relaxed">
            Historical log of all security evaluations performed by your account.
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 text-right">
          <Link href="/dashboard/analysis/new">
            <Button variant="primary" size="md">
              New Analysis <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Count */}
      {analyses.length > 0 && (
        <p className="font-technical text-xs mb-6" style={{ color: "var(--color-ink-4)" }}>
          {analyses.length} {analyses.length === 1 ? "ANALYSIS" : "ANALYSES"} TOTAL
        </p>
      )}

      {analyses.length === 0 ? (
        <div
          className="py-20 text-center"
          style={{ border: "1px solid var(--color-rule)", backgroundColor: "var(--color-surface)" }}
        >
          <p className="font-editorial text-lg mb-2" style={{ color: "var(--color-ink-2)" }}>
            No analyses yet.
          </p>
          <p className="text-sm mb-6" style={{ color: "var(--color-ink-4)" }}>
            Paste any security data to get started.
          </p>
          <Link href="/dashboard/analysis/new">
            <Button variant="primary">Run first analysis</Button>
          </Link>
        </div>
      ) : (
        <div style={{ border: "1px solid var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
          {/* Table header */}
          <div
            className="grid grid-cols-12 px-6 py-3"
            style={{ borderBottom: "1px solid var(--color-rule)", backgroundColor: "var(--color-surface-2)" }}
          >
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
          {analyses.map((a) => (
            <Link key={a.id} href={`/dashboard/analysis/${a.id}`}>
              <div
                className="grid grid-cols-12 px-6 py-4 items-center transition-colors duration-100 hover:bg-[--color-surface-2]"
                style={{ borderBottom: "1px solid var(--color-rule-light)" }}
              >
                {/* Date */}
                <p
                  className="col-span-2 font-technical text-xs"
                  style={{ color: "var(--color-ink-4)" }}
                >
                  {formatDate(a.created_at)}
                </p>

                {/* Title */}
                <div className="col-span-4 pr-4">
                  <p
                    className="font-ui text-sm font-medium truncate"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {a.title}
                  </p>
                </div>

                {/* Detected type */}
                <p
                  className="col-span-3 font-technical text-xs truncate pr-4"
                  style={{ color: "var(--color-ink-3)" }}
                >
                  {a.detected_type_label ?? "—"}
                </p>

                {/* Risk */}
                <div className="col-span-1">
                  {a.risk_score !== null && a.risk_score !== undefined ? (
                    <span
                      style={{
                        fontFamily: "var(--font-editorial)",
                        fontSize: "1.125rem",
                        color: `var(--color-${a.overall_severity})`,
                      }}
                    >
                      {a.risk_score}
                    </span>
                  ) : (
                    <span className="font-technical text-xs" style={{ color: "var(--color-ink-4)" }}>—</span>
                  )}
                </div>

                {/* Findings count */}
                <p
                  className="col-span-1 font-technical text-xs"
                  style={{ color: "var(--color-ink-3)" }}
                >
                  {Array.isArray(a.findings) ? a.findings.length : "—"}
                </p>

                {/* Status */}
                <div className="col-span-1">
                  {a.status === "completed" && a.overall_severity ? (
                    <SeverityBadge severity={a.overall_severity} />
                  ) : (
                    <span
                      className="font-technical text-xs"
                      style={{ color: "var(--color-ink-4)" }}
                    >
                      {a.status.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
