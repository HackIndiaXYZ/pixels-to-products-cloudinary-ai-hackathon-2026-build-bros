import { createAdminClient as createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/ui/badge";
import { AnalysisSummary } from "@/components/analysis/AnalysisSummary";
import { FindingsList } from "@/components/analysis/FindingsList";
import { formatDateTime } from "@/lib/utils";
import type { AnalysisResult } from "@/types";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

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
    <PageContainer>
      <PageHeader 
        category="SECURITY ANALYSIS"
        title={analysis.title}
        description={`Detected: ${analysis.detected_type_label?.toUpperCase() || 'UNKNOWN'} | Created: ${formatDateTime(analysis.created_at)}`}
        backLink="/dashboard/history"
        primaryAction={
          analysis.overall_severity && <SeverityBadge severity={analysis.overall_severity} />
        }
      />

      {/* ── Analysis content ──────────────────────────────────────────────── */}
      {analysis.status === "completed" ? (
        <div className="animate-in stagger-1 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.02)] p-8">
          <AnalysisSummary analysis={analysis} />

          {analysis.findings?.length > 0 && (
            <div className="mt-10">
              <FindingsList findings={analysis.findings} />
            </div>
          )}

          {/* Footer rule */}
          <div className="mt-10 pt-6 border-t border-gray-200/60">
            <div className="flex items-center justify-between">
              <p className="font-ui text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                SECUREFLOW AI — AI SECURITY INTELLIGENCE ENGINE
              </p>
              <Link href="/dashboard/analysis/new">
                <Button variant="secondary" size="sm">New Analysis</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : analysis.status === "analyzing" ? (
        <div className="py-24 text-center bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.02)]">
          <p className="font-ui text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">ANALYZING</p>
          <p className="font-editorial text-xl mb-2 text-gray-800">
            Detecting input type and running security analysis…
          </p>
          <p className="font-ui text-xs text-gray-500">
            This usually takes 10–30 seconds. Refresh to check progress.
          </p>
        </div>
      ) : (
        <div className="py-24 text-center bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.02)]">
          <p className="font-ui text-[11px] font-semibold text-red-500 uppercase tracking-wider mb-4">ANALYSIS FAILED</p>
          <p className="font-editorial text-xl mb-6 text-gray-800">
            Something went wrong during analysis.
          </p>
          <Link href="/dashboard/analysis/new">
            <Button variant="primary">Try again</Button>
          </Link>
        </div>
      )}
    </PageContainer>
  );
}
