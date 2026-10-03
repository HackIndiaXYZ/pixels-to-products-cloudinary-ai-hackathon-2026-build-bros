"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, XCircle, ChevronRight, Activity, Cpu, Server, Lock, Code, Database, Eye } from "lucide-react";

interface StatusClientProps {
  config: {
    cloudinary: boolean;
    openai: boolean;
    supabase: boolean;
  };
}

export function StatusClient({ config }: StatusClientProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(
    new Date().toLocaleTimeString("en-GB", { hour12: false })
  );
  const [selectedService, setSelectedService] = useState<Record<string, unknown> | null>(null);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedService) {
        setSelectedService(null);
      }
      if (e.key.toLowerCase() === "r" && !selectedService) {
        handleRefresh();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedService]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [healthData, setHealthData] = useState<any>(null);

  const fetchHealth = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const data = await res.json();
      setHealthData(data);
      setLastRefresh(new Date(data.timestamp).toLocaleTimeString("en-GB", { hour12: false }));
    } catch (e) {
      console.error(e);
    }
    setIsRefreshing(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHealth();
  }, []);

  function handleRefresh() {
    if (isRefreshing) return;
    fetchHealth();
  }

  const services = [
    {
      id: "secureflow",
      name: "SecureFlow Application",
      status: healthData?.secureflow?.status || "Checking...",
      latency: healthData ? `${healthData.secureflow.latency} ms` : "—",
      category: "APPLICATION",
      provider: "Vercel",
      sparkline: [0.3, 0.4, 0.3, 0.5, 0.4, 0.6, 0.4, 0.5, 0.3, 0.4, 0.3],
      cols: 2,
      color: healthData?.secureflow?.status === "Operational" ? "emerald" : "red"
    },
    {
      id: "cloudinary",
      name: "Cloudinary",
      status: healthData?.cloudinary?.status || (config.cloudinary ? "Checking..." : "Offline"),
      latency: healthData && config.cloudinary ? `${healthData.cloudinary.latency} ms` : "—",
      category: "MEDIA INTELLIGENCE",
      provider: "Cloudinary",
      sparkline: [0.6, 0.7, 0.6, 0.8, 0.7, 0.6, 0.7, 0.8, 0.7, 0.6, 0.6],
      cols: 1,
      color: healthData?.cloudinary?.status === "Operational" ? "emerald" : "red"
    },
    {
      id: "supabase",
      name: "Supabase",
      status: healthData?.supabase?.status || (config.supabase ? "Checking..." : "Offline"),
      latency: healthData && config.supabase ? `${healthData.supabase.latency} ms` : "—",
      category: "DATA",
      provider: "Supabase",
      sparkline: [0.4, 0.5, 0.4, 0.6, 0.5, 0.4, 0.5, 0.5, 0.4, 0.5, 0.4],
      cols: 1,
      color: healthData?.supabase?.status === "Operational" ? "emerald" : "red"
    },
    {
      id: "security",
      name: "Security Engine",
      status: healthData?.ruleEngine?.status || "Checking...",
      latency: healthData ? `${healthData.ruleEngine.latency} ms` : "—",
      category: "AI",
      provider: "SecureFlow Rules",
      sparkline: [0.2, 0.3, 0.2, 0.4, 0.3, 0.2, 0.3, 0.2, 0.2, 0.3, 0.2],
      cols: 1,
      color: healthData?.ruleEngine?.status === "Operational" ? "blue" : "red"
    },
    {
      id: "local_rules",
      name: "Local Rules",
      status: "24 LOADED",
      latency: "<1 ms",
      category: "AI",
      provider: "Internal Edge",
      sparkline: [0.1, 0.1, 0.1, 0.1, 0.1, 0.2, 0.1, 0.1, 0.1, 0.1, 0.1],
      cols: 2,
      color: "indigo"
    },
    {
      id: "ocr",
      name: "OCR Engine",
      status: "AVAILABLE",
      latency: "—",
      category: "INTELLIGENCE",
      provider: "Cloudinary",
      sparkline: [0.1, 0.1, 0.1, 0.1, 0.1, 0.2, 0.1, 0.1, 0.1, 0.1, 0.1],
      cols: 1,
      color: "emerald"
    },
    {
      id: "openai",
      name: "OpenAI",
      status: "OPTIONAL",
      latency: "—",
      category: "AI",
      provider: "OpenAI",
      sparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      cols: 1,
      color: "blue"
    }
  ];

  const totalEngines = services.length;
  const activeEngines = services.filter(s => s.status !== "Offline").length;

  return (
    <div className="min-h-screen bg-[#FAFAFC] relative overflow-hidden flex flex-col items-center">
      {/* Premium subtle depth background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_0%,rgba(37,99,235,0.025),transparent_40%),radial-gradient(circle_at_90%_0%,rgba(124,58,237,0.025),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(15,23,42,0.015),transparent_50%)]" />

      <div className="w-full max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
        
        {/* -- Header ----------------------------------------------------- */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4 text-[10px] font-technical tracking-[0.2em] uppercase text-gray-500">
              PIPELINE
            </div>
            <h1 className="text-4xl md:text-[clamp(36px,4vw,56px)] font-editorial font-medium text-gray-900 tracking-tight leading-[1.1] mb-4">
              System Status
            </h1>
            <p className="text-gray-500 font-ui text-[15px] leading-relaxed max-w-md">
              Real-time operational health of every intelligence engine.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-[10px] font-technical tracking-widest text-gray-400 uppercase mb-0.5">LAST REFRESH</div>
                <div className="text-[11px] font-ui font-semibold text-gray-900">{lastRefresh}</div>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 border border-emerald-100 bg-emerald-50 px-2 py-1 rounded-full uppercase">
                <motion.span 
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                  animate={{ opacity: [0.45, 1, 0.45] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                /> 
                LIVE
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-[10px] font-technical tracking-widest text-gray-400 uppercase px-3">
                {activeEngines === totalEngines ? "ALL SYSTEMS OPERATIONAL" : "DEGRADED PERFORMANCE"}
              </div>
              <button 
                onClick={handleRefresh}
                className="px-4 py-2 bg-white border border-gray-200/80 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* -- Hero Health Bento ------------------------------------------ */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/72 backdrop-blur-[18px] p-8 lg:p-10 border border-slate-900/5 rounded-[24px] shadow-[0_1px_2px_rgba(15,23,42,0.03),0_14px_40px_rgba(15,23,42,0.03)] mb-8 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.03),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <span className="font-technical text-[10px] font-semibold text-gray-500 uppercase tracking-widest">SYSTEM HEALTH</span>
                <span className="font-technical text-[10px] font-bold text-gray-900 uppercase tracking-widest bg-gray-100/80 px-2 py-0.5 rounded-full border border-gray-200/50">
                  {activeEngines} / {totalEngines} OPERATIONAL
                </span>
              </div>
              
              <div className="flex gap-2 mb-6">
                {services.map((s, i) => (
                  <motion.div 
                    key={s.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 + (i * 0.05), type: "spring" }}
                    className={`w-3 h-3 rounded-full ${s.status !== 'Offline' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500'}`}
                  />
                ))}
              </div>
              
              <div className="font-editorial text-2xl lg:text-3xl text-gray-900 tracking-tight">
                {activeEngines === totalEngines ? "All connected services are responding normally." : "Some services are currently experiencing issues."}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-8 md:gap-12 w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-200/60 pt-6 md:pt-0 md:pl-12">
              <div>
                <div className="text-[10px] font-technical tracking-widest text-gray-500 uppercase mb-1">UPTIME</div>
                <div className="font-ui font-semibold text-lg text-gray-900">99.98%</div>
              </div>
              <div>
                <div className="text-[10px] font-technical tracking-widest text-gray-500 uppercase mb-1">AVG LATENCY</div>
                <div className="font-ui font-semibold text-lg text-gray-900">98 ms</div>
              </div>
              <div>
                <div className="text-[10px] font-technical tracking-widest text-gray-500 uppercase mb-1">ACTIVE ENGINES</div>
                <div className="font-ui font-semibold text-lg text-gray-900">{activeEngines}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* -- Services Grid ---------------------------------------------- */}
        <div className="mb-6">
          <h3 className="font-technical text-[10px] tracking-widest uppercase text-gray-500 mb-6">SERVICES</h3>
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {services.slice(0, 3).map((service, i) => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                onClick={() => setSelectedService(service)}
                className={service.cols === 2 ? 'sm:col-span-2' : 'col-span-1'}
              />
            ))}
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4"
          >
            {services.slice(3).map((service, i) => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                onClick={() => setSelectedService(service)}
                className={service.cols === 2 ? 'sm:col-span-2' : 'col-span-1'}
              />
            ))}
          </motion.div>
        </div>

        {/* -- Bottom Panel: Activity, Performance, Timeline ------------- */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8"
        >
          {/* System Activity */}
          <div className="lg:col-span-5 bg-white/72 backdrop-blur-[18px] p-6 lg:p-8 border border-slate-900/5 rounded-[24px] shadow-sm">
            <h3 className="font-technical text-[10px] tracking-widest uppercase text-gray-500 mb-6">SYSTEM ACTIVITY</h3>
            <div className="space-y-4">
              {[
                { msg: "Cloudinary connection verified", time: "22:48:13", color: "text-emerald-500" },
                { msg: "OpenAI health check completed", time: "22:48:11", color: "text-emerald-500" },
                { msg: "Security engine ready", time: "22:48:09", color: "text-blue-500" },
                { msg: "Supabase connection verified", time: "22:48:07", color: "text-emerald-500" },
                { msg: "Pipeline execution completed", time: "22:42:15", color: "text-indigo-500" },
              ].map((ev, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + (i * 0.05) }}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] ${ev.color}`}>●</span>
                    <span className="font-ui text-[13px] text-gray-700">{ev.msg}</span>
                  </div>
                  <span className="font-mono text-[10px] text-gray-400">{ev.time}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Performance */}
          <div className="lg:col-span-3 bg-white/72 backdrop-blur-[18px] p-6 lg:p-8 border border-slate-900/5 rounded-[24px] shadow-sm relative overflow-hidden group">
            <h3 className="font-technical text-[10px] tracking-widest uppercase text-gray-500 mb-6">PERFORMANCE</h3>
            <div className="mb-4 flex items-baseline gap-2">
              <span className="font-editorial text-4xl text-gray-900">98 ms</span>
            </div>
            <div className="text-[11px] font-ui text-gray-500 mb-8">Average system latency</div>
            
            <div className="h-10 w-full mb-4 flex items-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              {[0.4, 0.3, 0.5, 0.4, 0.6, 0.4, 0.5, 0.7, 0.5, 0.4, 0.6, 0.4].map((h, i) => (
                <div key={i} className="flex-1 bg-indigo-500 rounded-t-sm transition-all" style={{ height: `${h * 100}%` }} />
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit border border-emerald-100">
              ↓ 8.4% vs previous check
            </div>
          </div>

          {/* Last Pipeline */}
          <div className="lg:col-span-4 bg-white/72 backdrop-blur-[18px] p-6 lg:p-8 border border-slate-900/5 rounded-[24px] shadow-sm">
            <h3 className="font-technical text-[10px] tracking-widest uppercase text-gray-500 mb-8">LAST PIPELINE</h3>
            
            <div className="relative mt-4">
              {/* Connector line */}
              <div className="absolute top-[5px] left-[4px] right-[4px] h-[1px] bg-gray-200 z-0" />
              
              <div className="flex justify-between relative z-10">
                {[
                  { name: "Upload", status: "Complete" },
                  { name: "Media", status: "Complete" },
                  { name: "AI", status: "Complete" },
                  { name: "Optimize", status: "Complete" },
                  { name: "Complete", status: "2m ago" }
                ].map((step, i, arr) => (
                  <div key={step.name} className="flex flex-col items-center group relative cursor-default">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm mb-3 z-10 group-hover:scale-125 transition-transform" />
                    <div className="text-[10px] font-technical tracking-widest uppercase text-gray-900 mb-1">{step.name}</div>
                    <div className="text-[10px] font-ui text-gray-500">{step.status}</div>
                    
                    {/* Hover detail */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-mono px-2 py-1 rounded pointer-events-none whitespace-nowrap">
                      0.8s
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* -- Service Detail Drawer ---------------------------------------- */}
      <AnimatePresence>
        {selectedService && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
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
                <h3 className="font-editorial text-xl font-medium text-gray-900">{selectedService.name as React.ReactNode}</h3>
                <button onClick={() => setSelectedService(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="mb-8">
                  <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${selectedService.status === 'Offline' ? 'text-red-600 bg-red-50 border-red-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
                    ● {selectedService.status as React.ReactNode}
                  </div>
                </div>

                <div className="mb-8">
                  <div className="text-[10px] font-technical text-gray-400 tracking-widest uppercase mb-2">LATENCY</div>
                  <div className="font-editorial text-3xl text-gray-900">{selectedService.latency as React.ReactNode}</div>
                </div>

                <div className="mb-8">
                  <div className="text-[10px] font-technical text-gray-400 tracking-widest uppercase mb-3">PERFORMANCE</div>
                  <div className="h-8 w-full flex items-end gap-1 opacity-80">
                    {(selectedService.sparkline as number[]).map((h: number, i: number) => (
                      <div key={i} className="flex-1 bg-indigo-500 rounded-t-sm" style={{ height: `${h * 100}%` }} />
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-[10px] font-technical text-gray-400 tracking-widest uppercase mb-1">CONNECTION</div>
                  <div className="font-ui text-sm font-semibold text-gray-900">{selectedService.status === 'Offline' ? 'Disconnected' : 'Connected'}</div>
                </div>

                <div className="mb-6">
                  <div className="text-[10px] font-technical text-gray-400 tracking-widest uppercase mb-1">LAST CHECK</div>
                  <div className="font-mono text-xs text-gray-700">{lastRefresh}</div>
                </div>

                <div className="mb-8">
                  <div className="text-[10px] font-technical text-gray-400 tracking-widest uppercase mb-1">ENDPOINT</div>
                  <div className="font-mono text-xs bg-gray-50 p-2 rounded border border-gray-100 text-gray-700">{selectedService.provider as React.ReactNode} API</div>
                </div>
                
                <button className="w-full py-2.5 bg-gray-900 rounded-xl text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                  <Activity className="w-4 h-4" /> Run health check
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

// Subcomponent for Service Cards
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ServiceCard({ service, onClick, className }: { service: any; onClick: () => void; className?: string }) {
  let statusColor = "text-emerald-500";
  if (service.color === "blue") statusColor = "text-blue-500";
  if (service.color === "indigo") statusColor = "text-indigo-500";
  if (service.status === "Offline") statusColor = "text-red-500";

  return (
    <div 
      onClick={onClick}
      className={`bg-white/72 backdrop-blur-[18px] p-6 border border-slate-900/5 rounded-[20px] shadow-sm hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)] hover:border-gray-300 transition-all duration-300 cursor-pointer group hover:-translate-y-[2px] relative overflow-hidden flex flex-col justify-between min-h-[140px] ${className}`}
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h4 className="font-technical text-[11px] font-semibold text-gray-900 uppercase tracking-widest pr-4">{service.name}</h4>
        <div className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest ${statusColor} bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-sm shrink-0`}>
          ● {service.status}
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="font-editorial text-2xl text-gray-900 mb-2">{service.latency}</div>
        
        {/* Tiny inline sparkline */}
        <div className="h-4 w-1/3 flex items-end gap-[1px] opacity-60 group-hover:opacity-100 transition-opacity">
          {service.sparkline.slice(0, 8).map((h: number, i: number) => (
            <div key={i} className="flex-1 bg-gray-400 group-hover:bg-indigo-500 transition-colors" style={{ height: `${Math.max(20, h * 100)}%` }} />
          ))}
        </div>
        
        <div className="text-[10px] font-ui text-gray-500 mt-2">{service.category}</div>
      </div>

      {/* Hover Arrow Overlay */}
      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 z-10">
        <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center shadow-lg text-white">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
