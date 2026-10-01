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
        className={`px-3 py-1 text-xs font-technical uppercase tracking-widest border transition-colors ${
          isActive
            ? "border-[--color-ink] bg-[--color-ink] text-[--color-background]"
            : "border-[--color-rule-strong] text-[--color-ink-3] hover:border-[--color-ink]"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="px-8 lg:px-12 pt-8 pb-24 max-w-[1400px] mx-auto w-full">
      <Breadcrumbs items={[
        { label: "INTELLIGENCE" },
        { label: "FINDINGS" }
      ]} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-[--color-rule] pb-6">
        <div>
          <h1 className="font-editorial text-3xl tracking-wide uppercase text-[--color-ink] mb-3">
            Security Findings
          </h1>
          <p className="font-ui text-sm text-[--color-ink-2] leading-relaxed">
            Observed signals and inferred risks across all analyzed evidence.
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 text-right">
          <div className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-1">
            ACTIVE DATABASE
          </div>
          <div className="font-technical text-sm text-[--color-ink]">
            SECUREFLOW AI POSTGRES
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[--color-rule] border border-[--color-rule] mb-8">
        <div className="bg-[--color-surface] p-6 hover:bg-[--color-surface-2] transition-colors group cursor-default">
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-4">TOTAL FINDINGS</p>
          <p className="font-editorial text-4xl text-[--color-ink] mb-2">{total.toString().padStart(2, '0')}</p>
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-3] uppercase">ACROSS ALL CASES</p>
        </div>
        <div className="bg-[--color-surface] p-6 hover:bg-[--color-surface-2] transition-colors group cursor-default">
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-4">OPEN</p>
          <p className="font-editorial text-4xl text-[--color-low] mb-2">{openCount.toString().padStart(2, '0')}</p>
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-3] uppercase">REQUIRES REVIEW</p>
        </div>
        <div className="bg-[--color-surface] p-6 hover:bg-[--color-surface-2] transition-colors group cursor-default">
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-4">REVIEWED</p>
          <p className="font-editorial text-4xl text-[--color-ink] mb-2">{reviewCount.toString().padStart(2, '0')}</p>
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-3] uppercase">IN PROGRESS</p>
        </div>
        <div className="bg-[--color-surface] p-6 hover:bg-[--color-surface-2] transition-colors group cursor-default">
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-4">RESOLVED</p>
          <p className="font-editorial text-4xl text-[--color-ink-4] mb-2">{resolvedCount.toString().padStart(2, '0')}</p>
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-3] uppercase">ARCHIVED</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-8">
        <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-3">FILTER</p>
        <div className="flex flex-wrap gap-2">
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
      <div className="border border-[--color-rule] bg-[--color-surface]">
        {allFindings.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-editorial text-lg text-[--color-ink-3] italic">No findings match this filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-[--color-rule-light]">
            {allFindings.map((finding) => (
              <div key={finding.id} className="p-6 hover:bg-[--color-surface-2] transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-1">
                      FINDING
                    </p>
                    <p className="font-editorial text-xl text-[--color-ink]">{finding.title}</p>
                  </div>
                  <span className={`font-technical text-[10px] uppercase tracking-widest px-2 py-1 border ${
                    finding.status === "OPEN" ? "border-[--color-low] text-[--color-low]" : "border-[--color-rule-strong] text-[--color-ink]"
                  }`}>
                    {finding.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-technical text-xs mt-6">
                  <div>
                    <span className="text-[--color-ink-4] uppercase tracking-widest block mb-1">Evidence</span>
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
                      className="text-[--color-ink-3] hover:text-[--color-ink] flex items-center gap-1 uppercase tracking-widest transition-colors"
                    >
                      VIEW <ArrowRight className="w-3 h-3" />
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
