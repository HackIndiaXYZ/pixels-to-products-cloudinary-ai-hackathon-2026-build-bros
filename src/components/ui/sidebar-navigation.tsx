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
import { motion } from "framer-motion";

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
    <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="font-technical text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = isActive(item.path, item.matchPaths);
              const Icon = item.icon;

              if (item.isHighlight) {
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className="relative flex items-center justify-between px-3 py-2.5 rounded-[14px] text-xs font-ui font-medium transition-all group overflow-hidden hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    {active ? (
                      <motion.div
                        layoutId="active-sidebar-bg"
                        className="absolute inset-0 bg-gradient-to-r from-blue-50/80 to-violet-50/80 rounded-[14px] border border-blue-100/50"
                        transition={{ type: "spring" as any, stiffness: 300, damping: 24 }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-50/50 border border-gray-100/50 rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    
                    {active && (
                      <motion.div 
                        layoutId="active-sidebar-indicator"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-blue-500 to-violet-500 rounded-r-full"
                        transition={{ type: "spring" as any, stiffness: 300, damping: 24 }}
                      />
                    )}

                    <div className={`relative z-10 flex items-center gap-2.5 ${active ? 'text-blue-700 font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                      <Icon className={`w-4 h-4 flex-shrink-0 transition-transform ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500 group-hover:scale-110'}`} />
                      <span>{item.name}</span>
                    </div>
                    <span className="relative z-10 font-technical text-[9px] font-bold tracking-widest bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-[6px]">NEW</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className="relative flex items-center justify-between px-3 py-2.5 rounded-[14px] text-xs font-ui font-medium transition-all group hover:-translate-y-[1px] active:scale-[0.98]"
                >
                  {active ? (
                    <motion.div
                      layoutId="active-sidebar-bg"
                      className="absolute inset-0 bg-blue-50/60 rounded-[14px]"
                      transition={{ type: "spring" as any, stiffness: 300, damping: 24 }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-50/50 rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                  
                  {active && (
                    <motion.div 
                      layoutId="active-sidebar-indicator"
                      className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full"
                      transition={{ type: "spring" as any, stiffness: 300, damping: 24 }}
                    />
                  )}

                  <div className={`relative z-10 flex items-center gap-2.5 ${active ? 'text-blue-700 font-semibold pl-1' : 'text-gray-600 group-hover:text-gray-900'}`}>
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-transform ${
                        active
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-900 group-hover:scale-110"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.count !== null &&
                    item.count !== undefined &&
                    item.count > 0 && (
                      <span
                        className={`relative z-10 font-technical text-[10px] font-bold px-2 py-0.5 rounded-[8px] tabular-nums ${
                          active
                            ? "bg-white/80 text-blue-700 shadow-sm border border-blue-100"
                            : "bg-gray-100 text-gray-500"
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
