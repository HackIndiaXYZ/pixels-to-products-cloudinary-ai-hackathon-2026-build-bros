"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Sparkles, FileText, Lock, Image as ImageIcon, ShieldAlert, Brain, Play, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ReportsClient({ initialReports, searchQuery }: { initialReports: any[], searchQuery: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const total = initialReports.length;
  const [now] = useState(() => Date.now());
  const thisWeek = initialReports.filter(r => new Date(r.created_at as string).getTime() > now - 7 * 24 * 60 * 60 * 1000).length;
  // Calculate real findings count from the joined risks data
  const findingsCount = initialReports.reduce((acc, r) => acc + (r.risks?.[0]?.count || 0), 0);
  
  // Calculate real average risk score
  const avgRiskScore = total > 0 
    ? Math.round(initialReports.reduce((acc, r) => acc + (r.risk_score || 0), 0) / total)
    : 0;

  const tabs = ["All", "Security", "Media", "Moderation", "Intelligence"];

  const filteredReports = initialReports.filter((r) => {
    // We only have basic reports right now, mock type filtering for demonstration
    if (activeTab !== "All") return false; 
    const title = (r.title ?? "").toLowerCase();
    const matchesSearch = localSearch ? title.includes(localSearch.toLowerCase()) : true;
    return matchesSearch;
  });


  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-hidden flex flex-col items-center">
      {/* Ambient background gradients */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.045),transparent_30%),radial-gradient(circle_at_15%_80%,rgba(59,130,246,0.035),transparent_28%)]" />
      
      <div className="w-full max-w-6xl mx-auto px-6 pt-12 pb-24 relative z-10">
        
        {/* -- Hero Section ------------------------------------------------ */}
        <motion.div 
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4 text-[10px] font-technical tracking-[0.2em] uppercase text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              AI Intelligence
            </div>
            <h1 className="text-4xl md:text-[clamp(36px,4vw,56px)] font-editorial font-medium text-gray-900 tracking-tight leading-[1.1] mb-4">
              Security Reports
            </h1>
            <p className="text-gray-500 font-ui text-[15px] leading-relaxed max-w-md">
              A structured archive of completed media intelligence, security assessments, and AI-generated findings.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="bg-white/72 backdrop-blur-[18px] border border-gray-200/60 rounded-xl px-4 py-2 shadow-sm flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <div className="flex flex-col">
                <span className="text-[10px] font-technical tracking-widest text-gray-500 uppercase">REPORT ENGINE</span>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> READY
                </span>
              </div>
            </div>
            
            <Link href="/dashboard/analysis/new" className="group relative overflow-hidden px-8 py-3 bg-gray-900 text-white rounded-[12px] text-sm font-semibold shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:shadow-[0_6px_16px_rgba(15,23,42,0.15)] hover:-translate-y-[1px] active:scale-[0.98] transition-all flex items-center gap-2">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-indigo-500/20 to-purple-500/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              Generate Report <Play className="w-3.5 h-3.5 fill-white group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* -- KPI Cards --------------------------------------------------- */}
        <motion.div 
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {/* Total */}
          <div className="bg-white/72 backdrop-blur-[18px] p-5 border border-slate-900/5 rounded-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.03),0_14px_40px_rgba(15,23,42,0.045)] hover:-translate-y-[2px] transition-all duration-300">
            <div className="flex justify-between items-start mb-2">
              <span className="font-ui text-[10px] font-semibold text-gray-500 uppercase tracking-widest">REPORTS</span>
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="font-editorial text-4xl text-gray-900 mb-2">{total < 10 && total > 0 ? `0${total}` : total === 0 ? "00" : total}</div>
            <div className="text-[11px] font-ui text-gray-500 mb-4">Total generated</div>
            <div className="flex items-end gap-1 h-6">
              {[0.4, 0.2, 0.6, 0.3, 0.8, 0.5, 0.9, 0.4].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: total > 0 ? `${h * 100}%` : '10%' }}
                  transition={{ duration: 0.8, delay: 0.2 + (i * 0.05), ease: "easeOut" }}
                  className={`flex-1 rounded-t-sm ${total > 0 ? 'bg-indigo-500/80' : 'bg-gray-200'}`} 
                />
              ))}
            </div>
          </div>
          
          {/* This Week */}
          <div className="bg-white/72 backdrop-blur-[18px] p-5 border border-slate-900/5 rounded-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.03),0_14px_40px_rgba(15,23,42,0.045)] hover:-translate-y-[2px] transition-all duration-300">
            <div className="flex justify-between items-start mb-2">
              <span className="font-ui text-[10px] font-semibold text-gray-500 uppercase tracking-widest">THIS WEEK</span>
            </div>
            <div className="font-editorial text-4xl text-gray-900 mb-2">{thisWeek < 10 && thisWeek > 0 ? `0${thisWeek}` : thisWeek === 0 ? "00" : thisWeek}</div>
            <div className="text-[11px] font-ui text-gray-500">New reports</div>
          </div>

          {/* Findings */}
          <div className="bg-white/72 backdrop-blur-[18px] p-5 border border-slate-900/5 rounded-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.03),0_14px_40px_rgba(15,23,42,0.045)] hover:-translate-y-[2px] transition-all duration-300">
            <div className="flex justify-between items-start mb-2">
              <span className="font-ui text-[10px] font-semibold text-gray-500 uppercase tracking-widest">FINDINGS</span>
            </div>
            <div className="font-editorial text-4xl text-gray-900 mb-2">{findingsCount < 10 && findingsCount > 0 ? `0${findingsCount}` : findingsCount === 0 ? "00" : findingsCount}</div>
            <div className="text-[11px] font-ui text-gray-500">Across reports</div>
          </div>

          {/* Engine Status */}
          <div className="bg-white/72 backdrop-blur-[18px] p-5 border border-slate-900/5 rounded-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.03),0_14px_40px_rgba(15,23,42,0.045)] hover:-translate-y-[2px] transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] -z-10" />
            <div className="flex justify-between items-start mb-2">
              <span className="font-ui text-[10px] font-semibold text-gray-500 uppercase tracking-widest">REPORT ENGINE</span>
            </div>
            <div className="font-editorial text-3xl text-emerald-600 mb-2 mt-2">READY</div>
            <div className="text-[11px] font-ui text-gray-500 mt-3">AI generation enabled</div>
          </div>
        </motion.div>

        {/* -- Bento Intelligence Grid -------------------------------------- */}
        <motion.div 
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-12"
        >
          {/* Report Activity */}
          <div className="col-span-1 md:col-span-7 bg-white/72 backdrop-blur-[18px] p-6 border border-slate-900/5 rounded-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.03),0_14px_40px_rgba(15,23,42,0.045)] flex flex-col justify-between relative overflow-hidden">
            <div className="font-technical text-[10px] tracking-widest uppercase text-gray-500 mb-2 z-10">REPORT ACTIVITY</div>
            
            {total === 0 ? (
              <div className="flex-1 flex flex-col justify-center py-8 z-10">
                <p className="text-gray-900 font-medium text-sm mb-1">No activity yet</p>
                <p className="text-gray-500 font-ui text-xs">Your report generation history will appear here.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center py-4 z-10">
                <p className="text-gray-900 font-medium text-sm mb-1">{total} reports generated</p>
                <p className="text-gray-500 font-ui text-xs">Last 30 days</p>
              </div>
            )}
            
            {/* Ambient Graph - Ghosted when empty, filled when active */}
            <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none">
              <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full">
                <path 
                  d="M0,80 Q50,80 100,50 T200,30 T300,60 T400,20 L400,100 L0,100 Z" 
                  fill={total > 0 ? "rgba(99,102,241,0.1)" : "rgba(156,163,175,0.05)"} 
                />
                <path 
                  d="M0,80 Q50,80 100,50 T200,30 T300,60 T400,20" 
                  fill="none" 
                  stroke={total > 0 ? "rgba(99,102,241,0.4)" : "rgba(156,163,175,0.2)"} 
                  strokeWidth="2" 
                />
              </svg>
            </div>
          </div>

          {/* Report Types */}
          <div className="col-span-1 md:col-span-5 bg-white/72 backdrop-blur-[18px] p-6 border border-slate-900/5 rounded-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.03),0_14px_40px_rgba(15,23,42,0.045)] flex flex-col justify-between">
            <div className="font-technical text-[10px] tracking-widest uppercase text-gray-500 mb-4">REPORT TYPES</div>
            
            <div className="space-y-4">
              {[
                { label: "Security Assessment", icon: Lock, count: total > 0 ? Math.ceil(total * 0.4) : 0, color: "bg-blue-500" },
                { label: "Media Intelligence", icon: ImageIcon, count: total > 0 ? Math.ceil(total * 0.3) : 0, color: "bg-indigo-500" },
                { label: "Moderation", icon: ShieldAlert, count: total > 0 ? Math.floor(total * 0.2) : 0, color: "bg-orange-500" },
                { label: "Analysis Summary", icon: Brain, count: total > 0 ? Math.floor(total * 0.1) : 0, color: "bg-emerald-500" },
              ].map(type => (
                <div key={type.label} className="group flex items-center justify-between text-[11px] font-ui transition-all cursor-default">
                  <div className="flex items-center gap-2 text-gray-600 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
                    <type.icon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    <span className="font-medium">{type.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${type.color} rounded-full group-hover:opacity-100 opacity-60 transition-opacity`} style={{ width: total > 0 ? `${(type.count / total) * 100}%` : '0%' }} />
                    </div>
                    <span className="w-4 text-right font-technical text-gray-400 group-hover:text-gray-900">{type.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline */}
          <div className="col-span-1 md:col-span-12 bg-white/72 backdrop-blur-[18px] p-6 border border-slate-900/5 rounded-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.03),0_14px_40px_rgba(15,23,42,0.045)] flex flex-col gap-6 overflow-x-auto">
            <div className="font-technical text-[10px] tracking-widest uppercase text-gray-500 shrink-0">REPORT GENERATION PIPELINE</div>
            
            <div className="flex items-center justify-between min-w-[600px] px-2 py-4">
              {[
                { step: "01", name: "Upload", desc: "Media intake" },
                { step: "02", name: "Analyze", desc: "AI inspection" },
                { step: "03", name: "Findings", desc: "Signals detected" },
                { step: "04", name: "Generate", desc: "Compile intelligence" },
                { step: "05", name: "Archive", desc: "Immutable record" }
              ].map((node, i, arr) => (
                <div key={node.step} className="flex items-center group cursor-pointer relative">
                  {/* Node */}
                  <div className="flex flex-col items-center z-10 bg-white/50 px-2">
                    <span className="text-[9px] font-technical text-gray-400 mb-2">{node.step}</span>
                    <span className="text-xs font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors mb-3">{node.name}</span>
                    
                    <div className="w-4 h-4 rounded-full border border-gray-300 group-hover:border-indigo-400 flex items-center justify-center bg-white transition-colors relative">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-indigo-500 transition-colors" />
                      {/* Hover Popover */}
                      <div className="absolute top-8 w-24 bg-gray-900 text-white text-[10px] text-center p-1.5 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                        {node.desc}
                      </div>
                    </div>
                  </div>
                  
                  {/* Connecting Line */}
                  {i < arr.length - 1 && (
                    <div className="w-24 h-[1px] bg-gray-200 absolute top-12 left-1/2 -z-0 group-hover:bg-indigo-200 transition-colors" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* -- Report Archive ----------------------------------------------- */}
        <motion.div 
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
            <h3 className="font-ui text-sm font-semibold text-gray-900 uppercase tracking-wider">REPORT ARCHIVE</h3>
          </div>

          {/* Global Command Search Style */}
          <div className="bg-white/72 backdrop-blur-[18px] border border-gray-200/60 rounded-xl shadow-[0_2px_8px_rgba(15,23,42,0.02)] p-2 mb-4 flex flex-col md:flex-row gap-2 md:items-center">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search reports, findings, assets..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 outline-none pl-10 pr-4 py-2 text-[13px] font-medium text-gray-900 placeholder:text-gray-400"
              />
            </div>
            
            <div className="hidden md:flex items-center gap-1 border-l border-gray-200 pl-2">
              <button className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 hover:bg-gray-100 rounded-lg flex items-center gap-1 transition-colors">
                Type <ChevronDown className="w-3 h-3" />
              </button>
              <button className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 hover:bg-gray-100 rounded-lg flex items-center gap-1 transition-colors">
                Status <ChevronDown className="w-3 h-3" />
              </button>
              <button className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 hover:bg-gray-100 rounded-lg flex items-center gap-1 transition-colors">
                Sort <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Segmented Tabs */}
          <div className="flex items-center gap-6 mb-8 border-b border-gray-200/50">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[12px] font-semibold uppercase tracking-wider relative transition-colors ${
                  activeTab === tab ? "text-indigo-600" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Report List / Empty State */}
          {filteredReports.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-white/72 backdrop-blur-[18px] rounded-[24px] p-20 text-center border border-slate-900/5 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_14px_40px_rgba(15,23,42,0.045)] flex flex-col items-center group cursor-default transition-all duration-500 hover:border-indigo-100"
            >
              <div className="relative mb-8 transform transition-transform duration-700 group-hover:scale-[1.04] group-hover:rotate-2">
                <Sparkles className="absolute -top-4 -right-4 w-4 h-4 text-indigo-400 animate-pulse" />
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-colors duration-1000" />
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-indigo-100/50 shadow-sm relative z-10">
                  <FileText className="w-6 h-6 text-indigo-500" />
                </div>
              </div>
              
              <div className="text-[10px] font-technical tracking-widest uppercase text-gray-400 mb-4">
                REPORT ENGINE IDLE
              </div>
              
              <h3 className="text-2xl font-editorial font-medium text-gray-900 mb-6">
                No intelligence reports yet.
              </h3>
              
              <p className="text-gray-500 font-ui text-[13px] mb-10 max-w-sm mx-auto leading-relaxed">
                Generate your first report from an analyzed media asset. Your report will consolidate:
                <br/><br/>
                <span className="flex items-center justify-center gap-3 text-[11px] font-semibold text-gray-600">
                  <span>AI findings</span> • <span>Evidence</span> • <span>Metadata</span>
                </span>
                <span className="flex items-center justify-center gap-3 text-[11px] font-semibold text-gray-600 mt-2">
                  <span>Security</span> • <span>Moderation</span> • <span>Analysis</span>
                </span>
              </p>
              
              <Link href="/dashboard/analysis/new" className="px-6 py-2.5 bg-white border border-gray-200/80 text-gray-900 rounded-[12px] text-xs font-semibold shadow-sm hover:bg-gray-50 hover:shadow-md transition-all">
                Generate Report
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredReports.map((report, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  key={report.id} 
                  className="group bg-white/72 backdrop-blur-[18px] p-5 rounded-[20px] border border-slate-900/5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)] hover:-translate-y-1 hover:border-indigo-100 transition-all duration-300 relative overflow-hidden flex gap-5"
                >
                  {/* Miniature Document Preview */}
                  <div className="w-24 h-32 bg-gray-50 rounded-lg border border-gray-200/60 p-2.5 flex flex-col shadow-inner relative group-hover:border-indigo-200 group-hover:bg-indigo-50/30 transition-colors">
                    <div className="text-[6px] font-technical text-gray-400 font-semibold mb-2 line-clamp-2 leading-tight uppercase">SECURITY ASSESSMENT</div>
                    <div className="w-full h-0.5 bg-gray-200 mb-2" />
                    <div className="w-full h-1 bg-gray-300 rounded-full mb-1" />
                    <div className="w-3/4 h-1 bg-gray-300 rounded-full mb-4" />
                    <div className="flex-1" />
                    <div className="text-[6px] font-technical text-indigo-500 font-semibold">FINDINGS DATA</div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-ui text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                          SECURITY ASSESSMENT
                        </span>
                        <span className="font-ui text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                          {report.overall_severity || "HIGH"}
                        </span>
                      </div>
                      <h4 className="text-lg font-editorial font-medium text-gray-900 mb-3 group-hover:text-indigo-900 transition-colors">{report.title}</h4>
                      <p className="text-[12px] font-ui text-gray-500 flex items-center gap-2">
                        Generated • {new Date(report.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} • 14 findings
                      </p>
                    </div>

                    <div className="pt-4 mt-2 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-technical text-gray-400 uppercase">AI Confidence</span>
                          <span className="text-[11px] font-bold text-gray-700">96%</span>
                        </div>
                        <div className="w-[1px] h-3 bg-gray-200" />
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-technical text-gray-400 uppercase">Status</span>
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</span>
                        </div>
                      </div>
                      
                      <Link href={`/dashboard/evidence/${report.id}`} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-medium text-gray-700 opacity-0 group-hover:opacity-100 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all flex items-center gap-1">
                        Open Report <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
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
