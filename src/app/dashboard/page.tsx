import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { AnalysisResult } from "@/types";
import {
  Plus,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ArrowRight,
  ImageIcon,
  BarChart3,
  Sparkles
} from "lucide-react";

export const metadata = { title: "Dashboard — SecureFlow AI" };

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: analyses } = await supabase
    .from("analyses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const list = (analyses ?? []) as AnalysisResult[];
  const completed = list.filter((a) => a.status === "completed");
  const activeInvestigations = list.filter(
    (a) => a.status === "pending" || a.status === "analyzing"
  ).length;
  const criticalFindings = completed.filter(
    (a) => a.overall_severity === "critical" || a.overall_severity === "high"
  ).length;
  const resolvedFindings = completed.filter(
    (a) => a.overall_severity !== "critical" && a.overall_severity !== "high"
  ).length;

  // Only show completion rate if there IS data — never invent 100%
  const pipelineSuccessRate =
    list.length > 0
      ? Math.round((completed.length / list.length) * 100)
      : null;

  const hasData = list.length > 0;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[--color-ink] mb-0.5">Overview</h1>
          <p className="text-sm text-[--color-ink-3]">
            Media intelligence and security analysis summary.
          </p>
        </div>
        <Link
          href="/dashboard/analysis/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Analysis
        </Link>
      </div>

      {/* ── Workspace Hero Banner ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-violet-700 p-6 shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 0%, transparent 60%), radial-gradient(circle at 80% 20%, white 0%, transparent 40%)' }} />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-1">
              Media Intelligence Platform
            </p>
            <h2 className="text-xl font-bold text-white mb-1">
              Media Intelligence Workspace
            </h2>
            <p className="text-sm text-blue-100">
              Upload → AI Analyze → Smart Crop → Transform → Optimize → Save
            </p>
          </div>
          <Link
            href="/dashboard/workspace"
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-xl font-bold text-sm shadow-md hover:bg-blue-50 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Open Workspace
          </Link>
        </div>
      </div>

      {/* ── KPI Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analyses */}
        <div className="bg-white rounded-2xl p-5 border border-[--color-rule] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[--color-ink-4] uppercase tracking-wide">
              Total Analyses
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-[--color-ink] tabular-nums">
            {list.length}
          </p>
          <p className="text-xs text-[--color-ink-4] mt-1">
            {hasData ? `${completed.length} completed` : "No analyses yet"}
          </p>
        </div>

        {/* Active Investigations */}
        <div className="bg-white rounded-2xl p-5 border border-[--color-rule] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[--color-ink-4] uppercase tracking-wide">
              Active
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-amber-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-[--color-ink] tabular-nums">
            {activeInvestigations}
          </p>
          <p className="text-xs text-[--color-ink-4] mt-1">In progress</p>
        </div>

        {/* Critical Findings */}
        <div className="bg-white rounded-2xl p-5 border border-[--color-rule] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[--color-ink-4] uppercase tracking-wide">
              Critical
            </span>
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-red-500 tabular-nums">
            {criticalFindings}
          </p>
          <p className="text-xs text-[--color-ink-4] mt-1">
            {criticalFindings > 0 ? "Require attention" : "No critical issues"}
          </p>
        </div>

        {/* Pipeline Rate */}
        <div className="bg-white rounded-2xl p-5 border border-[--color-rule] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[--color-ink-4] uppercase tracking-wide">
              Success Rate
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-[--color-ink] tabular-nums">
            {pipelineSuccessRate !== null ? `${pipelineSuccessRate}%` : "—"}
          </p>
          <p className="text-xs text-[--color-ink-4] mt-1">
            {pipelineSuccessRate !== null
              ? "Pipeline completion"
              : "No data yet"}
          </p>
        </div>
      </div>

      {/* ── Main two-column row ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Analyses — 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[--color-rule] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[--color-rule]">
            <h2 className="font-bold text-[--color-ink] text-sm">
              Recent Analyses
            </h2>
            <Link
              href="/dashboard/reports"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {!hasData ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-[--color-surface-2] flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-[--color-ink-4]" />
              </div>
              <h3 className="font-bold text-[--color-ink] mb-1">
                No analyses yet
              </h3>
              <p className="text-sm text-[--color-ink-3] mb-5">
                Upload your first media asset to begin AI analysis.
              </p>
              <Link
                href="/dashboard/analysis/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition-colors"
              >
                Start New Analysis
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[--color-rule]">
              {list.slice(0, 6).map((item) => {
                const sev = item.overall_severity;
                const sevColor =
                  sev === "critical"
                    ? "text-red-600 bg-red-50"
                    : sev === "high"
                    ? "text-orange-600 bg-orange-50"
                    : sev === "medium"
                    ? "text-amber-600 bg-amber-50"
                    : "text-emerald-600 bg-emerald-50";
                return (
                  <Link
                    key={item.id}
                    href={`/dashboard/evidence/${item.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-[--color-surface-2] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[--color-surface-2] border border-[--color-rule] flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-[--color-ink-4]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[--color-ink] truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[--color-ink-4]">
                        {new Date(item.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    {sev && (
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 ${sevColor}`}
                      >
                        {sev}
                      </span>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-[--color-ink-4] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions & Pipeline Status — 1/3 */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-[--color-rule] shadow-sm p-5">
            <h2 className="font-bold text-[--color-ink] text-sm mb-3">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link
                href="/dashboard/analysis/new"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[--color-rule] hover:border-blue-300 hover:bg-blue-50 transition-all text-xs font-bold text-[--color-ink] group"
              >
                <Plus className="w-3.5 h-3.5 text-blue-500" />
                Analyze New Media
                <ArrowRight className="w-3 h-3 ml-auto text-[--color-ink-4] group-hover:text-blue-500 transition-colors" />
              </Link>
              <Link
                href="/dashboard/evidence"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[--color-rule] hover:border-blue-300 hover:bg-blue-50 transition-all text-xs font-bold text-[--color-ink] group"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                Open Media Library
                <ArrowRight className="w-3 h-3 ml-auto text-[--color-ink-4] group-hover:text-blue-500 transition-colors" />
              </Link>
              <Link
                href="/dashboard/pipeline"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[--color-rule] hover:border-blue-300 hover:bg-blue-50 transition-all text-xs font-bold text-[--color-ink] group"
              >
                <Activity className="w-3.5 h-3.5 text-blue-500" />
                View Pipeline
                <ArrowRight className="w-3 h-3 ml-auto text-[--color-ink-4] group-hover:text-blue-500 transition-colors" />
              </Link>
              <Link
                href="/dashboard/findings"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[--color-rule] hover:border-blue-300 hover:bg-blue-50 transition-all text-xs font-bold text-[--color-ink] group"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Review Findings
                <ArrowRight className="w-3 h-3 ml-auto text-[--color-ink-4] group-hover:text-amber-500 transition-colors" />
              </Link>
            </div>
          </div>

          {/* System Summary */}
          <div className="bg-white rounded-2xl border border-[--color-rule] shadow-sm p-5">
            <h2 className="font-bold text-[--color-ink] text-sm mb-3">
              Intelligence Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[--color-ink-3]">Completed analyses</span>
                <span className="text-xs font-bold text-[--color-ink]">{completed.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[--color-ink-3]">Critical / High</span>
                <span className={`text-xs font-bold ${criticalFindings > 0 ? "text-red-500" : "text-emerald-600"}`}>
                  {criticalFindings}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[--color-ink-3]">Resolved</span>
                <span className="text-xs font-bold text-emerald-600">{resolvedFindings}</span>
              </div>
              <div className="flex justify-between items-center border-t border-[--color-rule] pt-3">
                <span className="text-xs text-[--color-ink-3]">Pipeline rate</span>
                <span className="text-xs font-bold text-[--color-ink]">
                  {pipelineSuccessRate !== null ? `${pipelineSuccessRate}%` : "N/A"}
                </span>
              </div>
            </div>
            <Link
              href="/dashboard/pipeline"
              className="flex items-center justify-center gap-1 mt-4 text-xs font-bold text-blue-600 hover:underline"
            >
              View pipeline <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── AI Processing tools strip ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[--color-rule] shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[--color-ink] text-sm">
            AI Processing Tools
          </h2>
          <Link
            href="/dashboard/pipeline"
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            View pipeline <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Smart Crop",
              description: "AI subject-aware cropping",
              href: "/dashboard/processing/smart-crop",
              color: "text-blue-600 bg-blue-50",
            },
            {
              label: "Background Removal",
              description: "Isolate subjects from media",
              href: "/dashboard/processing/background-removal",
              color: "text-violet-600 bg-violet-50",
            },
            {
              label: "Optimization",
              description: "f_auto + q_auto delivery",
              href: "/dashboard/processing/optimization",
              color: "text-emerald-600 bg-emerald-50",
            },
            {
              label: "Transform Studio",
              description: "Advanced transformations",
              href: "/dashboard/processing/transform-studio",
              color: "text-orange-600 bg-orange-50",
            },
          ].map((tool) => (
            <Link
              key={tool.label}
              href={tool.href}
              className="p-3 rounded-xl border border-[--color-rule] hover:border-blue-200 hover:shadow-sm transition-all group"
            >
              <div className={`w-8 h-8 rounded-lg ${tool.color} flex items-center justify-center mb-2`}>
                <BarChart3 className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-[--color-ink] mb-0.5">{tool.label}</p>
              <p className="text-[10px] text-[--color-ink-4]">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
