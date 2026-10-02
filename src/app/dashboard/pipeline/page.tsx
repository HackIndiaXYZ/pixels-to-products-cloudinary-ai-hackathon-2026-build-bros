import { createClient } from "@/lib/supabase/server";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
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
    <div className="max-w-[1400px] mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-[--color-ink] tracking-tight">Pipeline Console</h1>
            <span className="text-[10px] font-bold text-[--color-healthy] bg-[--color-healthy]/10 px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1 border border-[--color-healthy]/20">
              <span className="w-1.5 h-1.5 bg-[--color-healthy] rounded-full"></span>
              Operational
            </span>
          </div>
          <p className="text-sm text-[--color-ink-3] font-medium">Data ingestion, AI intelligence & security processing</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-[--color-ink-4] bg-[--color-surface-2] px-2 py-1 rounded-md uppercase tracking-widest border border-[--color-rule-light]">Event-Driven</span>
        </div>
      </div>

      <PipelineConsole metrics={metrics} config={config} recentMedia={recentMedia} />
    </div>
  );
}
