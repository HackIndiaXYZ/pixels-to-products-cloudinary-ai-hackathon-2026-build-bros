import { createAdminClient as createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FindingsClient } from "@/components/findings/FindingsClient";

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

  const allFindings = [...risks, ...observations].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return <FindingsClient initialFindings={allFindings} currentFilter={currentFilter} />;
}
