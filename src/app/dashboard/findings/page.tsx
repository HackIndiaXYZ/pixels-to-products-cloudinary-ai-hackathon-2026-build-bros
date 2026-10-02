import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, Search, FileWarning } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/states/EmptyState";

export const metadata = { title: "Findings - SecureFlow AI" };

export default async function FindingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const filters = await searchParams;
  const currentFilter = (filters.filter as string) || "all";

  // Fetch inferred risks
  const { data: risksData } = await supabase
    .from("risks")
    .select("*, analyses(title, id)")
    .order("created_at", { ascending: false });

  // Fetch observed signals
  const { data: obsData } = await supabase
    .from("observations")
    .select("*, analyses(title, id)")
    .order("created_at", { ascending: false });

  // Map into a unified "Findings" list
  const risks = (risksData ?? []).map((r) => ({
    id: `risk-${r.id}`,
    analysis_id: r.analysis_id,
    title: r.description || "Unknown Risk",
    severity: r.severity || "medium",
    source: "INFERRED",
    evidence: r.analyses?.title || "Unknown Asset",
    status: r.status || "OPEN",
    created_at: r.created_at,
  }));

  const observations = (obsData ?? []).map((o) => ({
    id: `obs-${o.id}`,
    analysis_id: o.analysis_id,
    title: o.content || "Unknown Observation",
    severity: "info",
    source: "OBSERVED",
    evidence: o.analyses?.title || "Unknown Asset",
    status: "REVIEW",
    created_at: o.created_at,
  }));

  let allFindings = [...risks, ...observations].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Stats
  const total = allFindings.length;
  const openCount = allFindings.filter((f) => f.status === "OPEN").length;
  const reviewCount = allFindings.filter((f) => f.status === "REVIEW").length;
  const resolvedCount = allFindings.filter((f) => f.status === "RESOLVED").length;

  // Filter
  if (currentFilter !== "all") {
    if (["critical", "high", "medium", "low", "info"].includes(currentFilter)) {
      allFindings = allFindings.filter((f) => f.severity.toLowerCase() === currentFilter);
    } else if (["open", "resolved"].includes(currentFilter)) {
      allFindings = allFindings.filter((f) => f.status.toLowerCase() === currentFilter);
    }
  }

  const FilterLink = ({ label, value }: { label: string; value: string }) => {
    const isActive = currentFilter === value;
    return (
      <Link
        href={`/dashboard/findings?filter=${value}`}
        className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg border transition-all ${
          isActive
            ? "border-[--color-ink] bg-[--color-ink] text-white shadow-sm"
            : "border-[--color-rule-light] bg-white text-[--color-ink-3] hover:border-[--color-ink-4] hover:text-[--color-ink]"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <PageContainer>
      <PageHeader 
        category="AI INTELLIGENCE"
        title="Findings Console"
        description="Observed signals and inferred risks across all analyzed media."
        primaryAction={
          <Link href="/dashboard/analysis/new" className="px-4 py-2 bg-gray-900 text-white rounded-[12px] text-xs font-medium shadow-sm hover:bg-gray-800 transition-all hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98]">
            Run Analysis
          </Link>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/70 backdrop-blur-sm p-5 border border-gray-200/60 rounded-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.02)] transition-all hover:shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
          <p className="font-ui text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">TOTAL FINDINGS</p>
          <p className="font-editorial text-3xl text-gray-900 mb-1">{total}</p>
          <p className="font-ui text-[11px] text-gray-400">Across All Media</p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm p-5 border border-gray-200/60 rounded-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.02)] transition-all hover:shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
          <p className="font-ui text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">OPEN</p>
          <p className="font-editorial text-3xl text-red-600 mb-1">{openCount}</p>
          <p className="font-ui text-[11px] text-gray-400">Requires Review</p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm p-5 border border-gray-200/60 rounded-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.02)] transition-all hover:shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
          <p className="font-ui text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">REVIEWED</p>
          <p className="font-editorial text-3xl text-blue-600 mb-1">{reviewCount}</p>
          <p className="font-ui text-[11px] text-gray-400">In Progress</p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm p-5 border border-gray-200/60 rounded-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.02)] transition-all hover:shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
          <p className="font-ui text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">RESOLVED</p>
          <p className="font-editorial text-3xl text-emerald-600 mb-1">{resolvedCount}</p>
          <p className="font-ui text-[11px] text-gray-400">Archived</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white/70 backdrop-blur-sm p-2 rounded-[16px] border border-gray-200/60 shadow-[0_2px_8px_rgba(15,23,42,0.02)] mb-6 flex items-center justify-between">
        <div className="flex gap-1 overflow-x-auto">
          <FilterLink label="All" value="all" />
          <FilterLink label="Critical" value="critical" />
          <FilterLink label="High" value="high" />
          <FilterLink label="Medium" value="medium" />
          <FilterLink label="Low" value="low" />
          <FilterLink label="Open" value="open" />
          <FilterLink label="Resolved" value="resolved" />
        </div>
      </div>

      {/* Findings List */}
      <div className="bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.02)] overflow-hidden">
        {allFindings.length === 0 ? (
          <EmptyState 
            icon={<FileWarning className="w-6 h-6" />}
            title="No findings match this filter"
            description="Adjust your filters or run a new analysis to see results."
          />
        ) : (
          <div className="divide-y divide-[--color-rule-light]">
            {allFindings.map((finding) => (
              <div key={finding.id} className="p-5 hover:bg-gray-50/50 transition-colors group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-ui text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      FINDING
                    </p>
                    <p className="font-editorial text-lg text-gray-900">{finding.title}</p>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                    finding.status === "OPEN" ? "bg-red-50 text-red-600 border-red-100" : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}>
                    {finding.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-ui text-[11px] mt-4">
                  <div>
                    <span className="text-gray-400 uppercase tracking-wider font-semibold block mb-1">Media</span>
                    <span className="text-gray-900 truncate block font-medium">{finding.evidence}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 uppercase tracking-wider font-semibold block mb-1">Source</span>
                    <span className="text-gray-900 font-medium">{finding.source}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-gray-400 uppercase tracking-wider font-semibold block mb-1">Severity</span>
                      <span className="text-gray-900 font-medium uppercase">{finding.severity}</span>
                    </div>
                    <Link
                      href={`/dashboard/evidence/${finding.analysis_id}`}
                      className="text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-[10px] flex items-center gap-1 font-medium transition-colors shadow-sm hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98]"
                    >
                      View Details <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
