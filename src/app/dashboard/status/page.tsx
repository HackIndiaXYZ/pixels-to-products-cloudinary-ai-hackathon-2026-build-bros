import { StatusClient } from "@/components/status/StatusClient";

export const metadata = { title: "System Status - SecureFlow AI" };

export default function StatusPage() {
  const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;
  const isCloudinaryConfigured = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  const config = {
    cloudinary: isCloudinaryConfigured,
    openai: isOpenAIConfigured,
    supabase: isSupabaseConfigured,
  };

  return <StatusClient config={config} />;
}
