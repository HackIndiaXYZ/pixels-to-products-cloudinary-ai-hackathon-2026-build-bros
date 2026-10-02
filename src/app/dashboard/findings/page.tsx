import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

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
    <div className="max-w-[1400px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-[--color-rule-light] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[--color-ink] tracking-tight mb-2">Findings Console</h1>
          <p className="text-sm font-semibold text-[--color-ink-3]">Observed signals and inferred risks across all analyzed media.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/analysis/new" className="px-4 py-2 bg-[--color-ink] text-white rounded-lg text-xs font-bold shadow-sm hover:bg-[--color-primary] transition-colors">
            + Run Analysis
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 border border-[--color-rule-light] rounded-2xl shadow-sm">
          <p className="text-xs font-bold tracking-widest text-[--color-ink-4] uppercase mb-4">TOTAL FINDINGS</p>
          <p className="text-4xl font-bold text-[--color-ink] mb-2">{total}</p>
          <p className="text-[10px] font-bold tracking-widest text-[--color-ink-3] uppercase">Across All Media</p>
        </div>
        <div className="bg-white p-6 border border-[--color-rule-light] rounded-2xl shadow-sm">
          <p className="text-xs font-bold tracking-widest text-[--color-ink-4] uppercase mb-4">OPEN</p>
          <p className="text-4xl font-bold text-[--color-warning] mb-2">{openCount}</p>
          <p className="text-[10px] font-bold tracking-widest text-[--color-ink-3] uppercase">Requires Review</p>
        </div>
        <div className="bg-white p-6 border border-[--color-rule-light] rounded-2xl shadow-sm">
          <p className="text-xs font-bold tracking-widest text-[--color-ink-4] uppercase mb-4">REVIEWED</p>
          <p className="text-4xl font-bold text-[--color-ink] mb-2">{reviewCount}</p>
          <p className="text-[10px] font-bold tracking-widest text-[--color-ink-3] uppercase">In Progress</p>
        </div>
        <div className="bg-white p-6 border border-[--color-rule-light] rounded-2xl shadow-sm">
          <p className="text-xs font-bold tracking-widest text-[--color-ink-4] uppercase mb-4">RESOLVED</p>
          <p className="text-4xl font-bold text-[--color-ink-4] mb-2">{resolvedCount}</p>
          <p className="text-[10px] font-bold tracking-widest text-[--color-ink-3] uppercase">Archived</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-[--color-rule-light] shadow-sm mb-8 flex items-center justify-between">
        <div className="flex gap-2">
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
      <div className="bg-white border border-[--color-rule-light] rounded-2xl shadow-sm overflow-hidden">
        {allFindings.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-[--color-ink-3]">No findings match this filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-[--color-rule-light]">
            {allFindings.map((finding) => (
              <div key={finding.id} className="p-6 hover:bg-[--color-surface-2] transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-bold tracking-widest text-[--color-ink-4] uppercase mb-1">
                      FINDING
                    </p>
                    <p className="text-lg font-bold text-[--color-ink]">{finding.title}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                    finding.status === "OPEN" ? "bg-red-50 text-red-700 border-red-200" : "bg-gray-50 border-[--color-rule-light] text-[--color-ink]"
                  }`}>
                    {finding.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-bold mt-6">
                  <div>
                    <span className="text-[--color-ink-4] uppercase tracking-widest block mb-1">Media</span>
                    <span className="text-[--color-ink] truncate block">{finding.evidence}</span>
                  </div>
                  <div>
                    <span className="text-[--color-ink-4] uppercase tracking-widest block mb-1">Source</span>
                    <span className="text-[--color-ink]">{finding.source}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[--color-ink-4] uppercase tracking-widest block mb-1">Severity</span>
                      <span className="text-[--color-ink] uppercase">{finding.severity}</span>
                    </div>
                    <Link
                      href={`/dashboard/evidence/${finding.analysis_id}`}
                      className="text-[--color-ink] hover:text-[--color-primary] bg-white border border-[--color-rule-light] px-3 py-1.5 rounded-lg flex items-center gap-1 uppercase tracking-widest transition-colors shadow-sm"
                    >
                      VIEW
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
