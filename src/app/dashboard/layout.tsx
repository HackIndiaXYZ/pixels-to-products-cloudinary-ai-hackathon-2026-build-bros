import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell/AppShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // Fetch real counts — only what sidebar badges show
  const [
    { count: evidenceCount },
    { count: findingsCount },
    { count: reportsCount }
  ] = await Promise.all([
    supabase.from("analyses").select("*", { count: "exact", head: true }),
    supabase.from("risks").select("*", { count: "exact", head: true }),
    supabase.from("analyses").select("*", { count: "exact", head: true })
  ]);

  // Real config state from env — no hardcoding
  const isCloudinaryConfigured = !!(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
  const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;
  const isSupabaseConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return (
    <AppShell 
      counts={{
        evidence: evidenceCount || 0,
        findings: findingsCount || 0,
        reports: reportsCount || 0
      }}
      config={{
        cloudinary: isCloudinaryConfigured,
        openai: isOpenAIConfigured,
        supabase: isSupabaseConfigured
      }}
    >
      {children}
    </AppShell>
  );
}
