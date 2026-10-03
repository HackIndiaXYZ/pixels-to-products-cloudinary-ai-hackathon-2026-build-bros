import { createAdminClient as createClient } from "@/lib/supabase/server";
import type { AnalysisResult } from "@/types";
import { DashboardClient } from "./DashboardClient";

export const metadata = { title: "Dashboard — SecureFlow AI" };

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: analyses } = await supabase
    .from("analyses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const list = (analyses ?? []) as AnalysisResult[];

  return (
    <PageContainer>
      <PageHeader 
        title="Command Center"
        description="Monitor system health, pipeline status, and recent intelligence."
      />
      <DashboardClient list={list} />
    </PageContainer>
  );
}
