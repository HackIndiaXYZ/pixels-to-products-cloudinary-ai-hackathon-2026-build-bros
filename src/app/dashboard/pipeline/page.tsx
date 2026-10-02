import { createClient } from "@/lib/supabase/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PipelineConsole } from "./PipelineConsole";

export const metadata = { title: "Pipeline - SecureFlow AI" };

export default async function PipelinePage() {
  const isCloudinaryConfigured = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;
  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabase = await createClient();
  const [{ count }, { data: recentAnalyses }] = await Promise.all([
    supabase.from("analyses").select("*", { count: "exact", head: true }),
    supabase.from("analyses").select("*").order("created_at", { ascending: false }).limit(4)
  ]);

  const metrics = {
    totalAssets: count ?? 0,
    avgProcessing: "1.8s", 
    failedRuns: 0,
  };

  const config = {
    cloudinary: isCloudinaryConfigured,
    openai: isOpenAIConfigured,
    supabase: isSupabaseConfigured,
  };

  const recentMedia = recentAnalyses || [];

  return (
    <PageContainer>
      <PageHeader 
        category="PROCESSING"
        title="Pipeline Console"
        description="Data ingestion, AI intelligence & security processing."
        secondaryActions={
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md uppercase tracking-widest border border-gray-200">Event-Driven</span>
          </div>
        }
      />

      <PipelineConsole metrics={metrics} config={config} recentMedia={recentMedia} />
    </PageContainer>
  );
}
