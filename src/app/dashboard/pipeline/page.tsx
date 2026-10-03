import { createAdminClient as createClient } from "@/lib/supabase/server";
import { PipelineClient } from "@/components/pipeline/PipelineClient";

export const metadata = { title: "Pipeline - SecureFlow AI" };

export default async function PipelinePage() {
  const isCloudinaryConfigured = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;
  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabase = await createClient();
  const [{ count }] = await Promise.all([
    supabase.from("analyses").select("*", { count: "exact", head: true })
  ]);

  const metrics = {
    totalAssets: count ?? 0,
    avgProcessing: "1.24s", 
    failedRuns: 0,
  };

  const config = {
    cloudinary: isCloudinaryConfigured,
    openai: isOpenAIConfigured,
    supabase: isSupabaseConfigured,
  };

  return <PipelineClient metrics={metrics} config={config} />;
}
