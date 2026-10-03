import { createAdminClient as createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ReportsClient } from "@/components/reports/ReportsClient";
import type { AnalysisResult } from "@/types";

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

  return <ReportsClient initialReports={list} searchQuery={query} />;
}
