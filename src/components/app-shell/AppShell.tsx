import { ReactNode } from "react";
import { SidebarNavigation } from "@/components/ui/sidebar-navigation";
import { SidebarHealthFooter } from "@/components/ui/sidebar-health-footer";
import { CreatorEasterEgg } from "@/components/ui/creator-easter-egg";
import { TopCommandBar } from "./TopCommandBar";
import { CommandPalette } from "@/components/ui/command-palette";

interface AppShellProps {
  children: ReactNode;
  counts: {
    evidence: number;
    findings: number;
    reports: number;
  };
  config: {
    cloudinary: boolean;
    openai: boolean;
    supabase: boolean;
  };
}

export function AppShell({ children, counts, config }: AppShellProps) {
  return (
    <div 
      className="min-h-screen flex text-[--color-ink] overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 20% 0%, rgba(37, 99, 235, 0.045), transparent 30%),
          radial-gradient(circle at 100% 20%, rgba(124, 58, 237, 0.035), transparent 30%),
          #FAFAFA
        `
      }}
    >
      <CommandPalette />

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className="w-[260px] flex-shrink-0 flex flex-col h-screen bg-white/70 backdrop-blur-xl border-r border-gray-200/50 z-20">
        <CreatorEasterEgg />
        <SidebarNavigation
          evidenceCount={counts.evidence}
          findingsCount={counts.findings}
          reportsCount={counts.reports}
        />
        <SidebarHealthFooter
          cloudinary={config.cloudinary}
          openai={config.openai}
          supabase={config.supabase}
        />
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto flex flex-col h-screen min-w-0">
        <TopCommandBar />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
