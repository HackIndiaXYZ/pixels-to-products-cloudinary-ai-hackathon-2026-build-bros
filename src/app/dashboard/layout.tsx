import Link from "next/link";
import { CommandPalette } from "@/components/ui/command-palette";
import { GlobalSearch } from "@/components/ui/global-search";
import { 
  LayoutDashboard, 
  FilePlus, 
  ShieldAlert, 
  FileText, 
  Database, 
  Archive as ArchiveIcon, 
  GitBranch, 
  Activity, 
  Settings 
} from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex relative"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <CommandPalette />
      
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        className="w-[260px] flex-shrink-0 flex flex-col sticky top-0 h-screen"
        style={{ borderRight: "1px solid var(--color-rule)", backgroundColor: "var(--color-surface)" }}
      >
        {/* Wordmark */}
        <div
          className="px-6 py-5"
          style={{ borderBottom: "1px solid var(--color-rule)" }}
        >
          <p className="font-ui text-[0.8125rem] font-bold tracking-[0.15em] uppercase" style={{ color: "var(--color-ink)" }}>
            SECUREFLOW AI
          </p>
          <p className="font-editorial text-[0.75rem] mt-1" style={{ color: "var(--color-ink-3)", fontStyle: "italic" }}>
            Security Intelligence
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          {/* COMMAND CENTER */}
          <div>
            <p className="eyebrow px-3 mb-2" style={{ color: "var(--color-ink-3)" }}>
              COMMAND CENTER
            </p>
            <div className="space-y-0.5">
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-[0.8125rem] transition-colors hover:bg-[--color-surface-2] rounded-sm font-medium" style={{ color: "var(--color-ink)" }}>
                <LayoutDashboard className="w-4 h-4 text-[--color-ink-3]" /> Overview
              </Link>
              <Link href="/dashboard/analysis/new" className="flex items-center gap-3 px-3 py-2 text-[0.8125rem] transition-colors hover:bg-[--color-surface-2] rounded-sm" style={{ color: "var(--color-ink-2)" }}>
                <FilePlus className="w-4 h-4 text-[--color-ink-3]" /> New Analysis
              </Link>
            </div>
          </div>

          {/* INTELLIGENCE */}
          <div>
            <p className="eyebrow px-3 mb-2" style={{ color: "var(--color-ink-3)" }}>
              INTELLIGENCE
            </p>
            <div className="space-y-0.5">
              <Link href="/dashboard/findings" className="flex items-center gap-3 px-3 py-2 text-[0.8125rem] transition-colors hover:bg-[--color-surface-2] rounded-sm" style={{ color: "var(--color-ink-2)" }}>
                <ShieldAlert className="w-4 h-4 text-[--color-ink-3]" /> Findings
              </Link>
              <Link href="/dashboard/reports" className="flex items-center gap-3 px-3 py-2 text-[0.8125rem] transition-colors hover:bg-[--color-surface-2] rounded-sm" style={{ color: "var(--color-ink-2)" }}>
                <FileText className="w-4 h-4 text-[--color-ink-3]" /> Reports
              </Link>
              <Link href="/dashboard/evidence" className="flex items-center gap-3 px-3 py-2 text-[0.8125rem] transition-colors hover:bg-[--color-surface-2] rounded-sm" style={{ color: "var(--color-ink-2)" }}>
                <Database className="w-4 h-4 text-[--color-ink-3]" /> Evidence
              </Link>
              <Link href="/dashboard/archive" className="flex items-center gap-3 px-3 py-2 text-[0.8125rem] transition-colors hover:bg-[--color-surface-2] rounded-sm" style={{ color: "var(--color-ink-2)" }}>
                <ArchiveIcon className="w-4 h-4 text-[--color-ink-3]" /> Archive
              </Link>
            </div>
          </div>

          {/* PIPELINE */}
          <div>
            <p className="eyebrow px-3 mb-2" style={{ color: "var(--color-ink-3)" }}>
              PIPELINE
            </p>
            <div className="space-y-0.5">
              <Link href="/dashboard/pipeline" className="flex items-center gap-3 px-3 py-2 text-[0.8125rem] transition-colors hover:bg-[--color-surface-2] rounded-sm" style={{ color: "var(--color-ink-2)" }}>
                <GitBranch className="w-4 h-4 text-[--color-ink-3]" /> Pipeline
              </Link>
              <Link href="/dashboard/status" className="flex items-center gap-3 px-3 py-2 text-[0.8125rem] transition-colors hover:bg-[--color-surface-2] rounded-sm" style={{ color: "var(--color-ink-2)" }}>
                <Activity className="w-4 h-4 text-[--color-ink-3]" /> Status
              </Link>
            </div>
          </div>

          {/* SYSTEM */}
          <div>
            <p className="eyebrow px-3 mb-2" style={{ color: "var(--color-ink-3)" }}>
              SYSTEM
            </p>
            <div className="space-y-0.5">
              <Link href="/dashboard/configuration" className="flex items-center gap-3 px-3 py-2 text-[0.8125rem] transition-colors hover:bg-[--color-surface-2] rounded-sm" style={{ color: "var(--color-ink-2)" }}>
                <Settings className="w-4 h-4 text-[--color-ink-3]" /> Configuration
              </Link>
            </div>
          </div>
        </nav>

        {/* Footer Status */}
        <div className="px-6 py-5 space-y-4 bg-[--color-background-alt]" style={{ borderTop: "1px solid var(--color-rule)" }}>
          <div className="flex items-center justify-between">
            <p className="eyebrow">CLOUDINARY</p>
            <div className="flex items-center gap-2 font-technical text-xs" style={{ color: "var(--color-ink-2)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-low)" }}></span>
              CONNECTED
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="eyebrow">ENGINE</p>
            <div className="flex items-center gap-2 font-technical text-xs" style={{ color: "var(--color-ink-2)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-low)" }}></span>
              LOCAL RULES
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="eyebrow">DATABASE</p>
            <div className="flex items-center gap-2 font-technical text-xs" style={{ color: "var(--color-ink-2)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-low)" }}></span>
              CONNECTED
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Global Search Header */}
        <div 
          className="h-[65px] px-8 flex items-center justify-between sticky top-0 z-10 bg-[--color-background]/90 backdrop-blur-md"
          style={{ borderBottom: "1px solid var(--color-rule-light)" }}
        >
          <GlobalSearch />
          <div className="flex items-center gap-6">
            <div className="font-technical text-[10px] tracking-widest flex items-center gap-2 text-[--color-ink-3] uppercase">
              <span className="px-1.5 py-0.5 border border-[--color-rule-strong] rounded-sm">⌘</span>
              <span>+</span>
              <span className="px-1.5 py-0.5 border border-[--color-rule-strong] rounded-sm">K</span>
            </div>
            <div className="flex items-center gap-2 font-technical text-xs text-[--color-ink-3] uppercase tracking-widest">
              <span className="w-2 h-2 border border-[--color-ink-3] rounded-full flex items-center justify-center">
                <span className="w-1 h-1 bg-[--color-ink-3] rounded-full"></span>
              </span>
              <span>03</span>
            </div>
          </div>
        </div>
        
        {children}
      </main>
    </div>
  );
}
