import { createAdminClient as createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell/AppShell";
import type { ServiceStatus } from "@/components/ui/sidebar-health-footer";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  let evidenceCount = 0;
  let findingsCount = 0;
  let reportsCount = 0;

  try {
    const [evidenceRes, findingsRes, reportsRes] = await Promise.all([
      supabase.from("analyses").select("*", { count: "exact", head: true }),
      supabase.from("risks").select("*", { count: "exact", head: true }),
      supabase.from("analyses").select("*", { count: "exact", head: true })
    ]);
    evidenceCount = evidenceRes.count || 0;
    findingsCount = findingsRes.count || 0;
    reportsCount = reportsRes.count || 0;
  } catch (err) {
    console.warn("Could not fetch sidebar counts during layout render:", err);
  }

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

  // Determine actual OpenAI runtime status (key present + working vs rate-limited)
  // We do a lightweight HEAD check to /v1/models — fast, doesn't cost tokens
  let openaiStatus: ServiceStatus = "unconfigured";
  if (isOpenAIConfigured) {
    try {
      const res = await fetch("https://api.openai.com/v1/models", {
        method: "HEAD",
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        cache: "no-store",
        signal: AbortSignal.timeout(3000), // 3s max
      });
      if (res.ok) {
        openaiStatus = "operational";
      } else if (res.status === 429) {
        openaiStatus = "degraded"; // Rate limited / no credits
      } else if (res.status === 401) {
        openaiStatus = "offline"; // Bad key
      } else {
        openaiStatus = "degraded";
      }
    } catch {
      // Network error / timeout — assume degraded rather than crashing layout
      openaiStatus = "degraded";
    }
  }

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
        supabase: isSupabaseConfigured,
        openaiStatus,
      }}
    >
      {children}
    </AppShell>
  );
}
