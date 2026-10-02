import Link from "next/link";
import Image from "next/image";
import { CommandPalette } from "@/components/ui/command-palette";
import { GlobalSearch } from "@/components/ui/global-search";
import { SidebarNavigation } from "@/components/ui/sidebar-navigation";
import { SidebarHealthFooter } from "@/components/ui/sidebar-health-footer";
import { CreatorEasterEgg } from "@/components/ui/creator-easter-egg";
import { createClient } from "@/lib/supabase/server";
import { Bell, FilePlus } from "lucide-react";

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
    <div className="min-h-screen flex bg-[--color-background] text-[--color-ink] overflow-hidden">
      <CommandPalette />

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className="w-[260px] flex-shrink-0 flex flex-col h-screen bg-white border-r border-[--color-rule] z-20">

        {/* Brand / Logo with Easter Egg */}
        <CreatorEasterEgg />

        {/* Navigation — scrollable */}
        <SidebarNavigation
          evidenceCount={evidenceCount || 0}
          findingsCount={findingsCount || 0}
          reportsCount={reportsCount || 0}
        />

        {/* Health footer — fixed at bottom */}
        <SidebarHealthFooter
          cloudinary={isCloudinaryConfigured}
          openai={isOpenAIConfigured}
          supabase={isSupabaseConfigured}
        />
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto flex flex-col h-screen min-w-0">

        {/* Top bar */}
        <div className="h-16 px-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-10 bg-[--color-background]/90 backdrop-blur-md border-b border-[--color-rule]">
          <div className="flex-1 max-w-sm">
            <div className="relative flex items-center w-full h-9 rounded-lg bg-white border border-[--color-rule] px-3 shadow-sm">
              <GlobalSearch />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/analysis/new"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs shadow-sm hover:bg-blue-700 transition-colors"
            >
              <FilePlus className="w-3.5 h-3.5" />
              New Analysis
            </Link>
            <button className="w-8 h-8 rounded-lg bg-white border border-[--color-rule] flex items-center justify-center text-[--color-ink-3] hover:text-[--color-ink] transition-colors shadow-sm">
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-violet-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              A
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
