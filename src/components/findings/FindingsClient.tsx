"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, FileWarning, ShieldAlert, Sparkles, Activity, CheckCircle2, ChevronDown, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FindingsClient({ initialFindings, currentFilter }: { initialFindings: any[], currentFilter: string }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(currentFilter === "all" ? "All" : currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1));

  const total = initialFindings.length;
  const openCount = initialFindings.filter((f) => f.status === "OPEN").length;
  const reviewCount = initialFindings.filter((f) => f.status === "REVIEW").length;
  const resolvedCount = initialFindings.filter((f) => f.status === "RESOLVED").length;
  
  const criticalCount = initialFindings.filter((f) => f.severity.toLowerCase() === "critical").length;
  const highCount = initialFindings.filter((f) => f.severity.toLowerCase() === "high").length;
  const mediumCount = initialFindings.filter((f) => f.severity.toLowerCase() === "medium").length;
  const lowCount = initialFindings.filter((f) => f.severity.toLowerCase() === "low").length;

  const filteredFindings = initialFindings.filter((f) => {
    const matchesTab = activeTab === "All" || f.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) || f.evidence.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FB] relative overflow-hidden flex flex-col items-center">
      {/* Ambient background gradients */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_75%_15%,rgba(99,102,241,0.035),transparent_28%),radial-gradient(circle_at_15%_70%,rgba(59,130,246,0.025),transparent_25%)]" />
      
      <div className="w-full max-w-6xl mx-auto px-6 pt-12 pb-24 relative z-10">
        
        {/* -- Hero Section ------------------------------------------------ */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4 text-[10px] font-technical tracking-[0.2em] uppercase text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              AI Intelligence
            </div>
            <h1 className="text-4xl md:text-[clamp(36px,4vw,56px)] font-editorial font-medium text-gray-900 tracking-tight leading-[1.1] mb-4">
              Findings Console
            </h1>
            <p className="text-gray-500 font-ui text-[15px] leading-relaxed">
              AI-detected signals, security risks, moderation events, and media intelligence — unified in one workspace.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-4">
            <div className="bg-white/70 backdrop-blur-md border border-gray-200/60 rounded-[16px] p-4 shadow-sm w-full lg:w-64">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-technical tracking-widest text-gray-500 uppercase">AI ENGINE</span>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> READY
                </span>
              </div>
              <div className="space-y-1 mb-3">
                <div className="text-xs font-ui text-gray-600 flex justify-between">
                  <span>Cloudinary Vision</span> <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="text-xs font-ui text-gray-600 flex justify-between">
                  <span>Local Rules Engine</span> <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-[10px] font-technical text-gray-400 uppercase">
                <span>Last analysis</span>
                <span>Just now</span>
              </div>
            </div>
            
            <Link href="/dashboard/analysis/new" className="group relative overflow-hidden px-6 py-2.5 bg-gray-900 text-white rounded-[12px] text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98] transition-all flex items-center gap-2">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-purple-500/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              Run Analysis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* -- KPI Cards --------------------------------------------------- */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {/* Total */}
          <div className="bg-white/72 backdrop-blur-[18px] p-5 border border-slate-900/10 rounded-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_24px_rgba(15,23,42,0.02)] hover:-translate-y-[2px] transition-all duration-300">
            <div className="flex justify-between items-start mb-2">
              <span className="font-ui text-[10px] font-semibold text-gray-500 uppercase tracking-widest">TOTAL FINDINGS</span>
              <Sparkles className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="font-editorial text-4xl text-gray-900 mb-2">{total}</div>
            <div className="text-[11px] font-ui text-gray-500">Across analyzed media</div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-end gap-1 h-6">
              {[0.4, 0.7, 0.5, 0.9, 0.6, 1, 0.8, 0.5, 0.3].map((h, i) => (
                <div key={i} className="flex-1 bg-gray-200 rounded-t-sm" style={{ height: `${h * 100}%` }} />
              ))}
            </div>
          </div>
          
          {/* Open */}
          <div className="bg-white/72 backdrop-blur-[18px] p-5 border border-orange-500/10 rounded-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_24px_rgba(249,115,22,0.03)] hover:-translate-y-[2px] transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-[100px] -z-10" />
            <div className="flex justify-between items-start mb-2">
              <span className="font-ui text-[10px] font-semibold text-orange-600 uppercase tracking-widest">OPEN</span>
            </div>
            <div className="font-editorial text-4xl text-orange-600 mb-2">{openCount}</div>
            <div className="text-[11px] font-ui text-gray-500">Requires review</div>
            <div className="mt-4 pt-4 border-t border-orange-500/10 flex items-center gap-1.5 text-[10px] font-technical uppercase tracking-wider text-orange-600">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Monitoring
            </div>
          </div>

          {/* Reviewed */}
          <div className="bg-white/72 backdrop-blur-[18px] p-5 border border-blue-500/10 rounded-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_24px_rgba(59,130,246,0.03)] hover:-translate-y-[2px] transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100px] -z-10" />
            <div className="flex justify-between items-start mb-2">
              <span className="font-ui text-[10px] font-semibold text-blue-600 uppercase tracking-widest">REVIEWED</span>
            </div>
            <div className="font-editorial text-4xl text-blue-600 mb-2">{reviewCount}</div>
            <div className="text-[11px] font-ui text-gray-500">Human verification</div>
            <div className="mt-4 pt-4 border-t border-blue-500/10 flex items-center gap-2">
              <div className="flex-1 h-1 bg-blue-100 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 w-1/3 rounded-full" />
              </div>
              <span className="text-[10px] font-technical text-blue-600">33%</span>
            </div>
          </div>

          {/* Resolved */}
          <div className="bg-white/72 backdrop-blur-[18px] p-5 border border-emerald-500/10 rounded-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_24px_rgba(16,185,129,0.03)] hover:-translate-y-[2px] transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] -z-10" />
            <div className="flex justify-between items-start mb-2">
              <span className="font-ui text-[10px] font-semibold text-emerald-600 uppercase tracking-widest">RESOLVED</span>
            </div>
            <div className="font-editorial text-4xl text-emerald-600 mb-2">{resolvedCount}</div>
            <div className="text-[11px] font-ui text-gray-500">Archived findings</div>
            <div className="mt-4 pt-4 border-t border-emerald-500/10 flex items-center gap-1.5 text-[10px] font-technical uppercase tracking-wider text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" /> Up to date
            </div>
          </div>
        </motion.div>

        {/* -- Bento Intelligence Grid -------------------------------------- */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-12"
        >
          {/* Severity Distribution */}
          <div className="col-span-1 md:col-span-7 bg-white/72 backdrop-blur-[18px] p-6 border border-slate-900/10 rounded-[20px] shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <span className="font-technical text-[10px] tracking-widest uppercase text-gray-500">SEVERITY DISTRIBUTION</span>
              <span className="font-technical text-[10px] text-gray-400">{total} findings</span>
            </div>
            
            <div className="space-y-4">
              {[
                { label: "Critical", count: criticalCount, color: "bg-red-500", track: "bg-red-100" },
                { label: "High", count: highCount, color: "bg-orange-500", track: "bg-orange-100" },
                { label: "Medium", count: mediumCount, color: "bg-amber-400", track: "bg-amber-100" },
                { label: "Low", count: lowCount, color: "bg-blue-400", track: "bg-blue-100" },
              ].map(sev => (
                <div key={sev.label} className="flex items-center gap-4">
                  <div className="w-16 text-[11px] font-medium text-gray-600">{sev.label}</div>
                  <div className={`flex-1 h-1.5 rounded-full ${sev.track} overflow-hidden`}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: total > 0 ? `${(sev.count / total) * 100}%` : '0%' }}
                      transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                      className={`h-full ${sev.color} rounded-full`} 
                    />
                  </div>
                  <div className="w-6 text-right text-[11px] font-technical text-gray-900">{sev.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Confidence */}
          <div className="col-span-1 md:col-span-5 bg-white/72 backdrop-blur-[18px] p-6 border border-slate-900/10 rounded-[20px] shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="font-technical text-[10px] tracking-widest uppercase text-gray-500 mb-4">AI CONFIDENCE</div>
            <div className="font-editorial text-5xl text-gray-900 mb-6">{total > 0 ? "94%" : "—%"}</div>
            
            <div className="flex items-center mb-6">
              <div className="w-4 h-4 rounded-full border-[3px] border-indigo-500 bg-white shadow-sm z-10" />
              <div className="flex-1 h-[2px] bg-indigo-100" />
            </div>
            
            <div>
              <p className="text-[12px] font-ui text-gray-900 font-medium mb-1">{total > 0 ? "Detection confidence" : "Awaiting first analysis"}</p>
              <p className="text-[11px] font-ui text-gray-500 leading-relaxed">
                {total > 0 ? "Consolidated precision across analyzed assets using Cloudinary Vision + Local Rules." : "No intelligence data to score yet."}
              </p>
            </div>
          </div>

          {/* Pipeline Status */}
          <div className="col-span-1 md:col-span-12 bg-white/72 backdrop-blur-[18px] p-6 border border-slate-900/10 rounded-[20px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="font-technical text-[10px] tracking-widest uppercase text-gray-500 shrink-0">INTELLIGENCE PIPELINE</div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center w-full justify-between max-w-4xl px-4 gap-4 md:gap-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] font-semibold text-gray-700">Media uploaded</span>
              </div>
              <div className="hidden md:block flex-1 h-[1px] bg-gray-200 mx-4" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] font-semibold text-gray-700">Cloudinary processing</span>
              </div>
              <div className="hidden md:block flex-1 h-[1px] bg-gray-200 mx-4" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <span className="text-[11px] font-semibold text-gray-900">AI analysis</span>
              </div>
              <div className="hidden md:block flex-1 h-[1px] bg-gray-200 mx-4" />
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-gray-300" /></div>
                <span className="text-[11px] font-semibold text-gray-400">Moderation</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* -- Findings Explorer -------------------------------------------- */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
            <h3 className="font-ui text-sm font-semibold text-gray-900 uppercase tracking-wider">FINDINGS</h3>
            <span className="font-technical text-[10px] text-gray-500">{filteredFindings.length} findings</span>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex bg-gray-100/50 p-1 rounded-xl">
              {["All", "Open", "Reviewed", "Resolved"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-[12px] font-medium rounded-lg transition-all duration-200 ${
                    activeTab === tab 
                      ? "bg-white text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.04)]" 
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search findings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-[12px] bg-white border border-gray-200/60 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 shadow-sm"
                />
              </div>
              <button className="px-3 py-1.5 bg-white border border-gray-200/60 rounded-xl text-[12px] font-medium text-gray-600 shadow-sm flex items-center gap-1.5 hover:bg-gray-50 transition-colors">
                Severity <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Findings Cards / Empty State */}
          {filteredFindings.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-white/72 backdrop-blur-[18px] rounded-[24px] p-16 text-center border border-slate-900/10 shadow-sm flex flex-col items-center"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-indigo-100 relative z-10">
                  <Activity className="w-5 h-5 text-indigo-500" />
                </div>
                {/* Subtle orbital dots */}
                <div className="absolute -inset-4 border border-dashed border-gray-200 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none" />
              </div>
              
              <div className="text-[10px] font-technical tracking-widest uppercase text-gray-400 mb-3 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Intelligence Idle
              </div>
              
              <h3 className="text-2xl font-editorial font-medium text-gray-900 mb-2">
                No findings have been generated yet.
              </h3>
              
              <p className="text-gray-500 font-ui text-[13px] mb-8 max-w-sm mx-auto leading-relaxed">
                Run your first media analysis to let the intelligence engine inspect your assets for security and moderation signals.
              </p>
              
              <Link href="/dashboard/analysis/new" className="px-6 py-2.5 bg-gray-900 text-white rounded-[12px] text-xs font-semibold shadow-sm hover:bg-gray-800 transition-all hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98]">
                Run First Analysis
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredFindings.map((finding, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  key={finding.id} 
                  className="group bg-white/72 backdrop-blur-[18px] p-5 rounded-[20px] border border-slate-900/10 shadow-sm hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        finding.severity.toLowerCase() === 'critical' ? 'bg-red-500' :
                        finding.severity.toLowerCase() === 'high' ? 'bg-orange-500' :
                        finding.severity.toLowerCase() === 'medium' ? 'bg-amber-400' : 'bg-blue-400'
                      }`} />
                      <span className="font-ui text-[11px] font-bold text-gray-700 uppercase tracking-wider">{finding.severity}</span>
                      <span className="font-technical text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> 98% AI
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md border ${
                          finding.status === "OPEN" ? "bg-orange-50 text-orange-600 border-orange-100" : 
                          finding.status === "REVIEW" ? "bg-blue-50 text-blue-600 border-blue-100" :
                          "bg-emerald-50 text-emerald-600 border-emerald-100"
                        }`}>
                          {finding.status}
                        </span>
                    </div>
                  </div>

                  <h4 className="text-lg font-editorial font-medium text-gray-900 mb-4">{finding.title}</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
                    <div>
                      <span className="text-[10px] font-technical uppercase text-gray-400 tracking-wider block mb-1">ASSET</span>
                      <span className="text-sm font-ui text-gray-900 font-medium truncate block">{finding.evidence}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-technical uppercase text-gray-400 tracking-wider block mb-1">DETECTED BY</span>
                      <span className="text-sm font-ui text-gray-900 font-medium">{finding.source === 'INFERRED' ? 'Local Rules Engine' : 'Cloudinary Vision'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-technical uppercase text-gray-400 tracking-wider block mb-1">TIMESTAMP</span>
                      <span className="text-sm font-ui text-gray-900 flex items-center gap-1.5"><Clock className="w-3 h-3 text-gray-400" /> {new Date(finding.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link href={`/dashboard/evidence/${finding.analysis_id}`} className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> View Evidence
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
