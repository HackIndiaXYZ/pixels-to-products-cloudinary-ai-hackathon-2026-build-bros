"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus,
  Database,
  Search,
  Tag,
  ShieldAlert,
  FileText,
  Crop,
  Layers,
  Zap,
  Wand2,
  GitBranch,
  Server,
  Settings,
  Sparkles,
} from "lucide-react";

type NavItem = {
  name: string;
  path: string;
  icon: React.ElementType;
  matchPaths?: string[];
  count?: number | null;
  isHighlight?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

export function SidebarNavigation({
  evidenceCount,
  findingsCount,
  reportsCount,
}: {
  evidenceCount?: number;
  findingsCount?: number;
  reportsCount?: number;
}) {
  const pathname = usePathname();

  const isActive = (path: string, matchPaths?: string[]) => {
    if (pathname === path) return true;
    if (matchPaths) return matchPaths.some((mp) => pathname.startsWith(mp));
    return false;
  };

  const navGroups: NavGroup[] = [
    {
      label: "Command Center",
      items: [
        { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
        {
          name: "Media Workspace",
          path: "/dashboard/workspace",
          icon: Sparkles,
          matchPaths: ["/dashboard/workspace"],
          isHighlight: true,
        },
        {
          name: "New Analysis",
          path: "/dashboard/analysis/new",
          icon: FilePlus,
        },
      ],
    },
    {
      label: "Media",
      items: [
        {
          name: "Library",
          path: "/dashboard/evidence",
          icon: Database,
          matchPaths: ["/dashboard/evidence"],
          count: evidenceCount ?? null,
        },
        {
          name: "Collections",
          path: "/dashboard/evidence", // placeholder for now
          icon: Database,
        },
        { name: "Search", path: "/dashboard/search", icon: Search },
      ],
    },
    {
      label: "AI Intelligence",
      items: [
        { name: "Auto Tagging", path: "/dashboard/evidence", icon: Tag },
        {
          name: "Moderation",
          path: "/dashboard/findings",
          icon: ShieldAlert,
        },
        {
          name: "Findings",
          path: "/dashboard/findings",
          icon: ShieldAlert,
          count: findingsCount ?? null,
        },
        {
          name: "Reports",
          path: "/dashboard/reports",
          icon: FileText,
          count: reportsCount ?? null,
        },
      ],
    },
    {
      label: "AI Processing",
      items: [
        {
          name: "Smart Crop",
          path: "/dashboard/processing/smart-crop",
          icon: Crop,
          matchPaths: ["/dashboard/processing/smart-crop"],
        },
        {
          name: "Background Removal",
          path: "/dashboard/processing/background-removal",
          icon: Layers,
          matchPaths: ["/dashboard/processing/background-removal"],
        },
        {
          name: "Optimization",
          path: "/dashboard/processing/optimization",
          icon: Zap,
          matchPaths: ["/dashboard/processing/optimization"],
        },
        {
          name: "Transform Studio",
          path: "/dashboard/processing/transform-studio",
          icon: Wand2,
          matchPaths: ["/dashboard/processing/transform-studio"],
        },
      ],
    },
    {
      label: "Operations",
      items: [
        { name: "Pipeline", path: "/dashboard/pipeline", icon: GitBranch },
        { name: "Status", path: "/dashboard/status", icon: Server },
      ],
    },
    {
      label: "System",
      items: [
        {
          name: "Configuration",
          path: "/dashboard/configuration",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="text-[10px] font-bold text-[--color-ink-4] uppercase tracking-widest px-2 mb-1.5">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item.path, item.matchPaths);
              const Icon = item.icon;

              if (item.isHighlight) {
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all group ${
                      active
                        ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-200"
                        : "bg-gradient-to-r from-blue-50 to-violet-50 text-blue-700 border border-blue-200 hover:from-blue-100 hover:to-violet-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    <span className="text-[9px] font-bold opacity-70">NEW</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all group ${
                    active
                      ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500 pl-[10px]"
                      : "text-[--color-ink-3] hover:text-[--color-ink] hover:bg-[--color-surface-2] border-l-2 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-3.5 h-3.5 flex-shrink-0 ${
                        active
                          ? "text-blue-600"
                          : "text-[--color-ink-4] group-hover:text-[--color-ink-3]"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.count !== null &&
                    item.count !== undefined &&
                    item.count > 0 && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${
                          active
                            ? "bg-blue-100 text-blue-700"
                            : "bg-[--color-surface-2] text-[--color-ink-4]"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <div className="h-4" />
    </nav>
  );
}
