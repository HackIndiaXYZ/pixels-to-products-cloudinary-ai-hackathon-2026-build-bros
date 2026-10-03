"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Settings, RefreshCw, Server, ShieldCheck, Cpu, Activity, Clock, CheckCircle2, XCircle, ChevronRight, FileText, Lock, Eye, CheckCircle, ArrowRight, Brain, Circle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PipelineClientProps {
  metrics: {
    totalAssets: number;
    avgProcessing: string;
    failedRuns: number;
  };
  config: {
    cloudinary: boolean;
    openai: boolean;
    supabase: boolean;
  };
}

export function PipelineClient({ metrics, config }: PipelineClientProps) {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [activeStage, setActiveStage] = useState<number>(-1);
  const [events, setEvents] = useState<{ id: string; time: string; msg: string; stage: string; type: "success" | "pending" | "info" | "error" }[]>([]);
  const [lastExecution, setLastExecution] = useState<{ time: string; duration: string; stages: number } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [drawerData, setDrawerData] = useState<any>(null);

  const runPipeline = () => {
    if (isRunning) return;
    setIsRunning(true);
    setDrawerOpen(false);
    
    setEvents([{ 
      id: crypto.randomUUID(), 
      time: new Date().toLocaleTimeString('en-GB', { hour12: false }), 
      msg: "Pipeline initialized. Connecting to Cloudinary...", 
      stage: "INGESTION", 
      type: "info" 
    }]);
    setActiveStage(0);

    const pipelineStages = [
      { name: "UPLOAD", desc: "Cloudinary upload completed (asset_9b2a.webp)", delay: 800 },
      { name: "NORMALIZE", desc: "Asset normalized (1080x1080, f_auto)", delay: 1500 },
      { name: "AI_VISION", desc: "Vision models detected 14 objects", delay: 2400 },
      { name: "TAGGING", desc: "Applied 38 semantic tags", delay: 3000 },
      { name: "MODERATION", desc: "Moderation passed (SAFE)", delay: 3600 },
      { name: "FINDINGS", desc: "Security assessment compiled", delay: 4200 },
      { name: "REPORT", desc: "Report generated successfully", delay: 4800 },
    ];

    let cumulativeTime = 0;
    pipelineStages.forEach((stage, idx) => {
      cumulativeTime += stage.delay - cumulativeTime;
      setTimeout(() => {
        setEvents((prev) => [
          {
            id: crypto.randomUUID(),
            time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
            msg: stage.desc,
            stage: stage.name,
            type: "success"
          },
          ...prev
        ]);
        
        // Map conceptual stages to the 4 visual nodes
        if (idx <= 1) setActiveStage(0); // Ingestion
        else if (idx <= 4) setActiveStage(1); // Media Intelligence
        else if (idx === 5) setActiveStage(2); // Security Analysis
        else if (idx === 6) setActiveStage(3); // Reporting

        if (idx === pipelineStages.length - 1) {
          setTimeout(() => {
            setEvents((prev) => [
              {
                id: crypto.randomUUID(),
                time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
                msg: "Pipeline execution completed successfully.",
                stage: "SYSTEM",
                type: "info"
              },
              ...prev
            ]);
            setIsRunning(false);
            setActiveStage(-1);
            setLastExecution({
              time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
              duration: "1.24s",
              stages: 7
            });
          }, 800);
        }
      }, cumulativeTime);
    });
  };

  const openDrawer = (stage: string) => {
    if (isRunning) return;
    setDrawerData({
      stage,
      status: "COMPLETED",
      time: "1.24s",
      input: "asset_9b2a.webp",
      output: "Analysis Result"
    });
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] relative overflow-hidden flex flex-col items-center">
      {/* Ambient Depth */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,rgba(37,99,235,0.035),transparent_40%),radial-gradient(circle_at_100%_0%,rgba(124,58,237,0.025),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(15,23,42,0.015),transparent_50%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(15,23,42,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

      <div className="w-full max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
        
        {/* -- Header Command Center -------------------------------------- */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4 text-[10px] font-technical tracking-[0.2em] uppercase text-gray-500">
              PROCESSING
            </div>
            <h1 className="text-4xl md:text-[clamp(36px,4vw,56px)] font-editorial font-medium text-gray-900 tracking-tight leading-[1.1] mb-4">
              Pipeline Console <span className="text-xl text-blue-500">(Test Simulator)</span>
            </h1>
            <p className="text-gray-500 font-ui text-[15px] leading-relaxed max-w-md">
              Simulate and observe the execution path of the media intelligence pipeline. Note: This page is a visual simulator.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-2 text-[10px] font-technical tracking-widest text-emerald-600 uppercase bg-emerald-50/50 px-3 py-1.5 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" /> ALL SYSTEMS OPERATIONAL
            </div>
            
            <div className="flex items-center gap-3">
              {lastExecution && !isRunning && (
                <div className="hidden sm:block text-right mr-4">
                  <div className="text-[10px] font-technical tracking-widest text-gray-400 uppercase mb-0.5">Last execution</div>
                  <div className="text-[11px] font-ui font-semibold text-gray-700">Today · {lastExecution.time}</div>
                </div>
              )}
              
              <button className="px-4 py-2.5 bg-white border border-gray-200/80 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all hover:-translate-y-[1px] active:scale-[0.98]">
                Configure
              </button>
              
              <button 
                onClick={runPipeline}
                disabled={isRunning}
                className={`group relative overflow-hidden px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2 ${
                  isRunning 
                  ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed" 
                  : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98]"
                }`}
              >
                {!isRunning && <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-indigo-500/20 to-purple-500/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700" />}
                {isRunning ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    Run Pipeline
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* -- Bento KPI Grid ---------------------------------------------- */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {/* Assets */}
          <div className="bg-white/72 backdrop-blur-[18px] p-5 border border-slate-900/5 rounded-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.04)] hover:-translate-y-[2px] transition-all duration-300 relative group overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="font-technical text-[10px] font-semibold text-gray-500 uppercase tracking-widest">TOTAL ASSETS</span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                ↗ +12%
              </div>
            </div>
            <div className="font-editorial text-4xl text-gray-900 mb-2">{metrics.totalAssets}</div>
            <div className="text-[11px] font-ui text-gray-500 mb-4">Processed through pipeline</div>
            <div className="absolute bottom-0 left-0 right-0 h-10 opacity-30 group-hover:opacity-60 transition-opacity">
              <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
                <path d="M0,30 L0,20 Q10,15 20,22 T40,10 T60,25 T80,5 T100,15 L100,30 Z" fill="rgba(99,102,241,0.2)" />
                <path d="M0,20 Q10,15 20,22 T40,10 T60,25 T80,5 T100,15" fill="none" stroke="rgba(99,102,241,0.8)" strokeWidth="1" />
              </svg>
            </div>
          </div>

          {/* Blocked */}
          <div className="bg-white/72 backdrop-blur-[18px] p-5 border border-slate-900/5 rounded-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.04)] hover:-translate-y-[2px] transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="font-technical text-[10px] font-semibold text-gray-500 uppercase tracking-widest">BLOCKED</span>
              <ShieldCheck className={`w-3.5 h-3.5 ${metrics.failedRuns > 0 ? "text-red-500" : "text-emerald-500"}`} />
            </div>
            <div className="font-editorial text-4xl text-gray-900 mb-2">{metrics.failedRuns}</div>
            <div className="text-[11px] font-ui text-gray-500">Threats neutralized</div>
          </div>

          {/* Cloudinary */}
          <div className="bg-white/72 backdrop-blur-[18px] p-5 border border-slate-900/5 rounded-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.04)] hover:-translate-y-[2px] transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="font-technical text-[10px] font-semibold text-gray-500 uppercase tracking-widest">CLOUDINARY</span>
              <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 border border-emerald-100 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> CONNECTED
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-6">
              {['Upload', 'Transform', 'Optimize', 'Delivery'].map(t => (
                <div key={t} className="text-[10px] font-ui font-medium text-gray-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-indigo-400" /> {t}
                </div>
              ))}
            </div>
          </div>

          {/* AI Engine */}
          <div className="bg-white/72 backdrop-blur-[18px] p-5 border border-slate-900/5 rounded-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.04)] hover:-translate-y-[2px] transition-all duration-300 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="font-technical text-[10px] font-semibold text-gray-500 uppercase tracking-widest">AI ENGINE</span>
              <span className="flex items-center gap-1.5 text-[9px] font-bold text-blue-600 border border-blue-100 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> OPERATIONAL
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-6 relative z-10">
              {['Vision', 'Tagging', 'Moderation', 'Analysis'].map(t => (
                <div key={t} className="text-[10px] font-ui font-medium text-gray-600 flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-blue-400" /> {t}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* -- Main Execution Area ------------------------------------------ */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8"
        >
          {/* Left: Execution Path */}
          <div className="lg:col-span-8 bg-white/72 backdrop-blur-[18px] p-6 lg:p-8 border border-slate-900/5 rounded-[24px] shadow-[0_1px_2px_rgba(15,23,42,0.03),0_14px_40px_rgba(15,23,42,0.03)]">
            <h3 className="font-technical text-[10px] tracking-widest uppercase text-gray-500 mb-8">LIVE EXECUTION PATH</h3>
            
            <div className="relative">
              {/* Vertical Connector Line */}
              <div className="absolute left-6 top-8 bottom-8 w-[1px] bg-gradient-to-b from-indigo-500/20 via-gray-200 to-gray-200" />

              {/* Node 1: Ingestion */}
              <div className="relative z-10 flex gap-6 mb-10">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm relative z-10">
                    <Server className={`w-5 h-5 ${activeStage === 0 ? "text-indigo-600" : "text-gray-400"}`} />
                  </div>
                  {activeStage === 0 && (
                    <motion.div 
                      layoutId="particle"
                      className="w-2 h-2 bg-indigo-500 rounded-full absolute -bottom-8 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 20, opacity: 1 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-technical tracking-widest text-indigo-500 font-bold">01</span>
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-widest">INGESTION</h4>
                  </div>
                  <div 
                    onClick={() => openDrawer('INGESTION')}
                    className={`p-4 rounded-xl border bg-white cursor-pointer transition-all ${
                      activeStage === 0 
                        ? "border-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.1)] ring-2 ring-indigo-50" 
                        : "border-gray-200 hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-ui font-semibold text-gray-900">Cloudinary</span>
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${activeStage === 0 ? "text-indigo-600 bg-indigo-50 border-indigo-200" : "text-emerald-600 bg-emerald-50 border-emerald-100"}`}>
                        {activeStage === 0 ? "● LIVE" : "● READY"}
                      </span>
                    </div>
                    <div className="text-[11px] font-ui text-gray-500 flex items-center gap-2">
                      Upload <ArrowRight className="w-3 h-3 text-gray-300" /> Normalize <ArrowRight className="w-3 h-3 text-gray-300" /> Optimize
                    </div>
                  </div>
                </div>
              </div>

              {/* Node 2: Media Intelligence */}
              <div className="relative z-10 flex gap-6 mb-10">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm relative z-10">
                    <Brain className={`w-5 h-5 ${activeStage === 1 ? "text-indigo-600" : "text-gray-400"}`} />
                  </div>
                  {activeStage === 1 && (
                    <motion.div 
                      layoutId="particle"
                      className="w-2 h-2 bg-indigo-500 rounded-full absolute -bottom-8 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 20, opacity: 1 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-technical tracking-widest text-indigo-500 font-bold">02</span>
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-widest">MEDIA INTELLIGENCE</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['Vision', 'Auto Tagging', 'Moderation'].map((module, i) => (
                      <div 
                        key={module}
                        onClick={() => openDrawer(module.toUpperCase())}
                        className={`p-3 rounded-xl border bg-white cursor-pointer transition-all ${
                          activeStage === 1 
                            ? "border-indigo-300 shadow-sm" 
                            : "border-gray-200 hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5"
                        }`}
                      >
                        <div className="text-xs font-bold text-gray-900 mb-2">{module}</div>
                        <div className="text-[9px] font-technical tracking-widest text-emerald-600 uppercase">● ACTIVE</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Node 3: Security Analysis */}
              <div className="relative z-10 flex gap-6">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm relative z-10">
                    <Lock className={`w-5 h-5 ${activeStage === 2 || activeStage === 3 ? "text-indigo-600" : "text-gray-400"}`} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-technical tracking-widest text-indigo-500 font-bold">03</span>
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-widest">SECURITY ANALYSIS & REPORT</h4>
                  </div>
                  <div 
                    onClick={() => openDrawer('SECURITY_ANALYSIS')}
                    className={`p-4 rounded-xl border bg-white cursor-pointer transition-all flex items-center justify-between ${
                      activeStage === 2 || activeStage === 3 
                        ? "border-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.1)] ring-2 ring-indigo-50" 
                        : "border-gray-200 hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="text-[11px] font-ui font-medium text-gray-600 flex items-center gap-1.5 flex-wrap">
                      Detection <ArrowRight className="w-3 h-3 text-gray-300" /> 
                      Classification <ArrowRight className="w-3 h-3 text-gray-300" /> 
                      Findings <ArrowRight className="w-3 h-3 text-gray-300" /> 
                      Report
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Pipeline Events Stream */}
          <div className="lg:col-span-4 bg-white/72 backdrop-blur-[18px] border border-slate-900/5 rounded-[24px] shadow-[0_1px_2px_rgba(15,23,42,0.03),0_14px_40px_rgba(15,23,42,0.03)] flex flex-col overflow-hidden h-full min-h-[500px]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white/50">
              <h3 className="font-technical text-[10px] tracking-widest uppercase text-gray-500">LIVE EVENT STREAM</h3>
              <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest ${isRunning ? 'text-indigo-600' : 'text-gray-400'}`}>
                {isRunning ? <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />} 
                {isRunning ? 'LIVE' : 'STANDBY'}
              </span>
            </div>
            
            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-4">
              <AnimatePresence>
                {events.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60 m-auto py-12"
                  >
                    <div className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-1">PIPELINE STANDING BY</div>
                      <div className="text-[11px] font-ui text-gray-500 max-w-[200px]">Run the test pipeline to observe real-time Cloudinary and AI events.</div>
                    </div>
                  </motion.div>
                ) : (
                  events.map((ev) => (
                    <motion.div 
                      key={ev.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3"
                    >
                      <div className="mt-1 shrink-0">
                        {ev.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {ev.type === "info" && <Circle className="w-4 h-4 text-blue-500 fill-blue-500/20" />}
                        {ev.type === "error" && <XCircle className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="flex-1 pb-4 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] text-gray-400">{ev.time}</span>
                          <span className="font-technical text-[9px] tracking-widest text-indigo-400 uppercase">{ev.stage}</span>
                        </div>
                        <p className="font-ui text-sm text-gray-900 leading-snug">{ev.msg}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* -- Intelligence & Architecture Bento ---------------------------- */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          {/* Processing Intelligence */}
          <div className="col-span-1 md:col-span-5 bg-white/72 backdrop-blur-[18px] p-6 border border-slate-900/5 rounded-[20px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <span className="font-technical text-[10px] font-semibold text-gray-500 uppercase tracking-widest">PROCESSING INTELLIGENCE</span>
              <span className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase border border-indigo-100">
                ● LIVE
              </span>
            </div>
            
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-editorial text-5xl text-gray-900">98.7%</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">↑ 4.2%</span>
            </div>
            
            {/* SVG Sparkline */}
            <div className="h-12 w-full mb-6 flex items-end gap-1">
               {[0.3, 0.4, 0.3, 0.5, 0.6, 0.5, 0.7, 0.8, 0.8, 1, 1, 1, 1, 1].map((h, i) => (
                 <div key={i} className="flex-1 bg-indigo-500 rounded-t-sm" style={{ height: `${h * 100}%` }} />
               ))}
            </div>
            
            <div className="space-y-3 font-ui text-[12px]">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Avg. processing</span>
                <span className="font-semibold text-gray-900">{metrics.avgProcessing}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Assets processed</span>
                <span className="font-semibold text-gray-900">{metrics.totalAssets}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Failures</span>
                <span className="font-semibold text-gray-900">{metrics.failedRuns}</span>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="col-span-1 md:col-span-3 bg-white/72 backdrop-blur-[18px] p-6 border border-slate-900/5 rounded-[20px] shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-technical text-[10px] tracking-widest uppercase text-gray-500 mb-6">SYSTEM HEALTH</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-ui text-sm font-semibold text-gray-900">Cloudinary</span>
                  <span className="text-[10px] font-technical text-emerald-600">● Operational</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-full" /></div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-ui text-sm font-semibold text-gray-900">AI Engine</span>
                  <span className="text-[10px] font-technical text-emerald-600">● Operational</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[98%]" /></div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-ui text-sm font-semibold text-gray-900">Database</span>
                  <span className="text-[10px] font-technical text-emerald-600">● Connected</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-full" /></div>
              </div>
            </div>
          </div>

          {/* Pipeline Architecture */}
          <div className="col-span-1 md:col-span-4 bg-gray-900 p-6 rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.1)] text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)]" />
            <h3 className="font-technical text-[10px] tracking-widest uppercase text-gray-400 mb-6 relative z-10">PIPELINE ARCHITECTURE</h3>
            
            <div className="font-mono text-[10px] leading-relaxed text-gray-300 relative z-10">
              <div className="text-white font-bold mb-1">Media</div>
              <div className="pl-2 border-l border-gray-700 ml-1 py-1">
                ↓<br/>
                <span className="text-white font-bold inline-block my-1">Cloudinary</span><br/>
                ├── Upload<br/>
                ├── Transform<br/>
                └── Optimize<br/>
                <span className="pl-2">↓</span><br/>
                <span className="text-white font-bold inline-block my-1">AI Intelligence</span><br/>
                ├── Vision<br/>
                ├── Tagging<br/>
                └── Moderation<br/>
                <span className="pl-2">↓</span><br/>
                <span className="text-white font-bold inline-block my-1">Security Intelligence</span><br/>
                ├── Findings<br/>
                └── Reports
              </div>
            </div>
            
            {/* Hover overlay hint */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[10px] font-technical tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
              VIEW DOCS <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </motion.div>

      </div>

      {/* -- Execution Drawer Overlay ------------------------------------- */}
      <AnimatePresence>
        {drawerOpen && drawerData && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 border-l border-gray-200 flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-editorial text-xl font-medium text-gray-900">{drawerData.stage}</h3>
                <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="mb-6">
                  <div className="text-[10px] font-technical text-gray-400 tracking-widest uppercase mb-1">STATUS</div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="font-ui font-semibold text-gray-900">{drawerData.status}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="text-[10px] font-technical text-gray-400 tracking-widest uppercase mb-1">EXECUTION TIME</div>
                  <div className="font-mono text-sm text-gray-900">{drawerData.time}</div>
                </div>

                <div className="mb-6">
                  <div className="text-[10px] font-technical text-gray-400 tracking-widest uppercase mb-1">INPUT</div>
                  <div className="font-mono text-xs bg-gray-50 p-2 rounded border border-gray-100 text-gray-700">{drawerData.input}</div>
                </div>

                <div className="mb-8">
                  <div className="text-[10px] font-technical text-gray-400 tracking-widest uppercase mb-1">OUTPUT DATA</div>
                  <div className="font-mono text-xs bg-gray-900 text-green-400 p-4 rounded-xl border border-gray-800 shadow-inner overflow-x-auto whitespace-pre">
{`{
  "stage": "${drawerData.stage}",
  "status": "success",
  "data": {
    "objects_detected": 14,
    "confidence": 0.98,
    "moderation": "SAFE"
  }
}`}
                  </div>
                </div>
                
                <button onClick={() => setDrawerOpen(false)} className="w-full py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" /> View full logs
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
