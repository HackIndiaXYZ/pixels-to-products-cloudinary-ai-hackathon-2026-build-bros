import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/ui/badge";
import { AnalysisSummary } from "@/components/analysis/AnalysisSummary";
import { FindingsList } from "@/components/analysis/FindingsList";
import { formatDateTime } from "@/lib/utils";
import type { AnalysisResult } from "@/types";

interface PageProps { params: Promise<{ id: string }>; }

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("analyses").select("title").eq("id", id).single();
  return { title: data?.title ?? "Security Analysis" };
}

export default async function AnalysisResultPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (error || !data) notFound();
  const analysis = data as AnalysisResult;

  return (
    <div className="px-10 py-10 max-w-4xl mx-auto">

      {/* Back */}
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          Overview
        </Button>
      </Link>

      {/* ── Report header ─────────────────────────────────────────────────── */}
      <div
        className="pb-6 mb-0"
        style={{ borderBottom: "1px solid var(--color-rule-strong)" }}
      >
        <p className="eyebrow mb-4">SECUREFLOW AI — SECURITY ANALYSIS</p>
        <h1
          className="mb-3"
          style={{
            fontFamily: "var(--font-editorial)",
            fontSize: "1.75rem",
            lineHeight: "1.2",
            color: "var(--color-ink)",
          }}
        >
          {analysis.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          {analysis.detected_type_label && (
            <span className="font-technical text-xs" style={{ color: "var(--color-ink-3)" }}>
              DETECTED — {analysis.detected_type_label.toUpperCase()}
            </span>
          )}
          <span className="font-technical text-xs" style={{ color: "var(--color-ink-4)" }}>
            {formatDateTime(analysis.created_at)}
          </span>
          {analysis.overall_severity && <SeverityBadge severity={analysis.overall_severity} />}
        </div>
      </div>

      {/* ── Analysis content ──────────────────────────────────────────────── */}
      {analysis.status === "completed" ? (
        <div className="animate-in stagger-1">
          <AnalysisSummary analysis={analysis} />

          {analysis.findings?.length > 0 && (
            <div className="mt-10">
              <FindingsList findings={analysis.findings} />
            </div>
          )}

          {/* Footer rule */}
          <div className="mt-10 pt-6" style={{ borderTop: "1px solid var(--color-rule)" }}>
            <div className="flex items-center justify-between">
              <p className="font-technical text-xs" style={{ color: "var(--color-ink-4)" }}>
                SECUREFLOW AI — AI SECURITY INTELLIGENCE ENGINE
              </p>
              <Link href="/dashboard/analysis/new">
                <Button variant="secondary" size="sm">New Analysis</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : analysis.status === "analyzing" ? (
        <div className="py-24 text-center">
          <p className="eyebrow mb-4" style={{ color: "var(--color-ink-4)" }}>ANALYZING</p>
          <p className="font-editorial text-xl mb-2" style={{ color: "var(--color-ink-2)" }}>
            Detecting input type and running security analysis…
          </p>
          <p className="font-technical text-xs" style={{ color: "var(--color-ink-4)" }}>
            This usually takes 10–30 seconds. Refresh to check progress.
          </p>
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="eyebrow mb-4" style={{ color: "var(--color-critical)" }}>ANALYSIS FAILED</p>
          <p className="font-editorial text-xl mb-6" style={{ color: "var(--color-ink-2)" }}>
            Something went wrong during analysis.
          </p>
          <Link href="/dashboard/analysis/new">
            <Button variant="primary">Try again</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
