"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ImageIcon,
  BarChart3,
  Sparkles,
  Crop,
  Layers,
  Zap,
  Layout,
  Search,
  Eye,
  Settings2,
  Database,
  Cpu
} from "lucide-react";
import type { AnalysisResult } from "@/types";
import { useEffect, useState } from "react";

// Simple count up animation hook
function useCountUp(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  
  return count;
}

export function DashboardClient({ list }: { list: AnalysisResult[] }) {
  const completed = list.filter((a) => a.status === "completed");
  const activeInvestigations = list.filter(
    (a) => a.status === "pending" || a.status === "analyzing"
  ).length;
  const criticalFindings = completed.filter(
    (a) => a.overall_severity === "critical" || a.overall_severity === "high"
  ).length;
  const resolvedFindings = completed.filter(
    (a) => a.overall_severity !== "critical" && a.overall_severity !== "high"
  ).length;

  const pipelineSuccessRate = list.length > 0 ? Math.round((completed.length / list.length) * 100) : 0;
  const hasData = list.length > 0;

  // Animated values
  const totalCount = useCountUp(list.length);
  const activeCount = useCountUp(activeInvestigations);
  const criticalCount = useCountUp(criticalFindings);
  const successCount = useCountUp(pipelineSuccessRate);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1400px] mx-auto space-y-8 pb-12"
    >
      {/* ── Header ────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-editorial font-medium text-[--color-ink] mb-2 tracking-tight">
            Good afternoon, Rishvin.
          </h1>
          <p className="font-ui text-sm text-[--color-ink-3]">
            Your media intelligence workspace at a glance.
          </p>
        </div>
      </motion.div>

      {/* ── Workspace Hero Banner ─────────────────────────────────── */}
      <motion.div 
        variants={itemVariants} 
        className="relative overflow-hidden rounded-[24px] bg-white border border-gray-200/60 p-8 shadow-[0_8px_30px_-4px_rgba(15,23,42,0.04)]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-violet-50/50 pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <p className="font-technical text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Media Intelligence Workspace
              </p>
            </div>
            <h2 className="text-2xl font-editorial font-medium text-gray-900 mb-2">
              Upload. Analyze. Transform. Optimize.
            </h2>
            <p className="font-ui text-sm text-gray-600 mb-6">
              One continuous media intelligence workflow powered by Cloudinary.
            </p>
            
            {/* Animated Pipeline Diagram */}
            <div className="flex items-center gap-2 font-technical text-[11px] tracking-widest uppercase text-gray-400">
              <span className="text-blue-600 font-bold">Upload</span>
              <div className="h-px w-8 bg-gradient-to-r from-blue-600 to-gray-200 relative overflow-hidden">
                <motion.div 
                  className="absolute top-0 left-0 h-full w-4 bg-white/80 blur-[2px]"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <span className="text-gray-700 font-bold">Analyze</span>
              <div className="h-px w-8 bg-gray-200"></div>
              <span>Process</span>
              <div className="h-px w-8 bg-gray-200"></div>
              <span>Optimize</span>
              <div className="h-px w-8 bg-gray-200"></div>
              <span>Save</span>
            </div>
          </div>
          
          <Link
            href="/dashboard/workspace"
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-[14px] font-ui font-medium text-sm shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:bg-gray-800 transition-all hover:-translate-y-0.5 active:scale-[0.98] group"
          >
            Open Workspace <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>

      {/* ── KPI Grid ──────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Assets", val: totalCount, subtitle: hasData ? `${completed.length} processed` : "No assets yet", icon: Database, color: "text-blue-600 bg-blue-50/50 border-blue-100", raw: list.length },
          { label: "Active Jobs", val: activeCount, subtitle: "In progress right now", icon: Activity, color: "text-amber-500 bg-amber-50/50 border-amber-100", raw: activeInvestigations },
          { label: "Flagged", val: criticalCount, subtitle: criticalFindings > 0 ? "Require attention" : "No critical issues", icon: AlertTriangle, color: "text-red-500 bg-red-50/50 border-red-100", raw: criticalFindings },
          { label: "Success Rate", val: successCount, suffix: "%", subtitle: hasData ? "Pipeline completion" : "No data yet", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50/50 border-emerald-100", raw: pipelineSuccessRate },
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white rounded-[20px] p-6 border border-gray-200/50 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.02)] hover:border-gray-200 hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.06)] transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-technical text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {kpi.label}
              </span>
              <div className={`w-8 h-8 rounded-[10px] border flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-end gap-1">
              <p className="font-editorial text-4xl font-medium text-gray-900 tracking-tight tabular-nums">
                {kpi.val}
              </p>
              {kpi.suffix && <span className="font-editorial text-2xl font-medium text-gray-400 mb-1">{kpi.suffix}</span>}
            </div>
            <p className="font-ui text-xs text-gray-500 mt-2">
              {kpi.subtitle}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Main two-column row ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Analyses — 2/3 width */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-[24px] border border-gray-200/50 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.02)] flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="font-ui font-semibold text-gray-900 text-sm">
              Activity Feed
            </h2>
            <Link
              href="/dashboard/reports"
              className="font-ui text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors group"
            >
              View all <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {!hasData ? (
            <div className="flex flex-col items-center justify-center flex-1 py-16 text-center px-6">
              <div className="w-12 h-12 rounded-[14px] bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                <Database className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="font-editorial font-medium text-lg text-gray-900 mb-1">
                Nothing here yet
              </h3>
              <p className="font-ui text-sm text-gray-500 mb-6 max-w-sm">
                Upload media to start building your intelligence library.
              </p>
              <Link
                href="/dashboard/workspace"
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-[12px] font-ui font-medium text-sm shadow-[0_1px_2px_rgba(15,23,42,0.02)] hover:shadow-md hover:border-gray-300 transition-all hover:-translate-y-0.5"
              >
                Upload Media
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {list.slice(0, 5).map((item, i) => {
                const sev = item.overall_severity;
                const isSafe = sev !== "critical" && sev !== "high";
                return (
                  <Link
                    key={item.id}
                    href={`/dashboard/evidence/${item.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-[12px] bg-white border border-gray-200 shadow-sm flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-ui text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </p>
                        {sev && (
                          <span className={`font-technical text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            isSafe ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {sev}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 font-ui text-[11px] text-gray-500">
                        <span>AI Analysis</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span>{new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white border border-gray-100 shadow-sm font-ui text-[11px] text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Complete
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Quick Actions — 1/3 */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-white rounded-[24px] border border-gray-200/50 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.02)] p-6">
            <h2 className="font-technical text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link
                href="/dashboard/workspace"
                className="flex items-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-[14px] font-ui text-sm font-medium hover:bg-gray-800 transition-all shadow-[0_2px_8px_rgba(15,23,42,0.08)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.12)] hover:-translate-y-[1px] group"
              >
                <Plus className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                Analyze New Media
                <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>
              
              {[
                { label: "Open Media Library", icon: Database, href: "/dashboard/evidence" },
                { label: "Processing Studio", icon: Cpu, href: "/dashboard/processing/transform-studio" },
                { label: "Review Findings", icon: Shield, href: "/dashboard/findings", badge: criticalFindings > 0 ? criticalFindings : null }
              ].map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className="flex items-center gap-3 px-4 py-3 bg-white border border-transparent hover:border-gray-200 hover:bg-gray-50 rounded-[14px] font-ui text-sm font-medium text-gray-700 transition-all group"
                >
                  <action.icon className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                  {action.label}
                  {action.badge && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-technical text-[10px] font-bold">
                      {action.badge}
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-[24px] border border-gray-200/50 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.02)] p-6">
            <h2 className="font-technical text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
              System Health
            </h2>
            <div className="space-y-4">
              {['Cloudinary', 'OpenAI', 'Database'].map((sys, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="font-ui text-sm text-gray-600">{sys}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-ui text-xs text-gray-500">Operational</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-ui text-gray-400">
              <span>All systems operational</span>
              <span>Updated just now</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
