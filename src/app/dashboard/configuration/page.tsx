import { ConfigurationClient } from "@/components/configuration/ConfigurationClient";

export const metadata = { title: "Configuration - SecureFlow AI" };

export default function ConfigurationPage() {
  const isCloudinaryConfigured = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const isCloudinaryUploadPreset = !!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;

  const config = {
    cloudinary: isCloudinaryConfigured,
    cloudinaryUploadPreset: isCloudinaryUploadPreset,
    supabase: isSupabaseConfigured,
    openai: isOpenAIConfigured,
  };

  return <ConfigurationClient config={config} />;
}
