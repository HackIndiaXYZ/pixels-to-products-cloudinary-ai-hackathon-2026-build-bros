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
    <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-8">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="text-[10.5px] font-semibold text-slate-500/80 uppercase tracking-[0.14em] px-3 mb-3">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = isActive(item.path, item.matchPaths);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`relative flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-180 group ${
                    active
                      ? "text-slate-900 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900"
                  }`}
                  style={
                    active
                      ? {
                          background: "linear-gradient(90deg, rgba(37, 99, 235, 0.08), rgba(99, 102, 241, 0.04))",
                        }
                      : {}
                  }
                >
                  {/* Active Indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-blue-600 rounded-r-full" />
                  )}

                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-[18px] h-[18px] transition-transform duration-180 group-hover:translate-x-[2px] ${
                        active ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"
                      }`}
                      strokeWidth={2}
                    />
                    <span className="leading-none mt-[1px]">{item.name}</span>
                  </div>
                  
                  {/* Badges / Counters */}
                  {item.isHighlight && (
                    <span className="font-technical text-[9px] font-bold tracking-widest bg-blue-100/80 text-blue-700 px-1.5 py-0.5 rounded-[6px]">
                      NEW
                    </span>
                  )}
                  {item.count !== null && item.count !== undefined && item.count > 0 && (
                    <span
                      className={`font-technical text-[10px] font-bold px-2 py-0.5 rounded-[8px] tabular-nums ${
                        active
                          ? "bg-white text-blue-700 shadow-sm"
                          : "bg-slate-100 text-slate-500"
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
