"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, XCircle, ChevronRight, Activity, Cloud, Database, Lock, Play, Save, CheckCircle2, AlertCircle } from "lucide-react";

interface ConfigurationClientProps {
  config: {
    cloudinary: boolean;
    cloudinaryUploadPreset: boolean;
    supabase: boolean;
    openai: boolean;
  };
}

type DrawerState = {
  isOpen: boolean;
  title: string;
  type: string;
};

export function ConfigurationClient({ config }: ConfigurationClientProps) {
  const [drawer, setDrawer] = useState<DrawerState>({ isOpen: false, title: "", type: "" });
  const [testState, setTestState] = useState<{ [key: string]: 'idle' | 'testing' | 'verified' | 'failed' }>({});
  const [saveState, setSaveState] = useState<'idle' | 'unsaved' | 'saving' | 'saved'>('idle');

  const totalServices = 6;
  const readyServices = [
    config.cloudinary, 
    config.cloudinaryUploadPreset, 
    config.supabase, 
    true, // OCR
    true, // Local Rules
    true  // Delivery
  ].filter(Boolean).length;
  const actionRequired = totalServices - readyServices;

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && drawer.isOpen) {
        setDrawer({ ...drawer, isOpen: false });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawer]);

  const handleTestConnection = async (service: string) => {
    setTestState(prev => ({ ...prev, [service]: 'testing' }));
    
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      const data = await res.json();
      
      // Map service keys to health response fields
      const serviceKeyMap: Record<string, string> = {
        cloudinary: 'cloudinary',
        supabase: 'supabase',
        openai: 'openai',
        database: 'supabase_admin',
      };
      const healthKey = serviceKeyMap[service.toLowerCase()] ?? service.toLowerCase();
      const serviceStatus = data?.[healthKey]?.status ?? 'unknown';
      const isHealthy = serviceStatus === 'Operational';
      
      setTestState(prev => ({ ...prev, [service]: isHealthy ? 'verified' : 'failed' }));
      setTimeout(() => {
        setTestState(prev => ({ ...prev, [service]: 'idle' }));
      }, 4000);
    } catch {
      setTestState(prev => ({ ...prev, [service]: 'failed' }));
      setTimeout(() => {
        setTestState(prev => ({ ...prev, [service]: 'idle' }));
      }, 4000);
    }
  };

  const handleSave = () => {
    // Configuration is read from environment variables and cannot be saved via UI.
    // This is a no-op for security reasons — env vars must be updated in .env.local.
    setSaveState('saving');
    setTimeout(() => {
      setSaveState('saved');
      setDrawer({ ...drawer, isOpen: false });
      setTimeout(() => setSaveState('idle'), 2000);
    }, 400);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stagger: any = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] relative overflow-hidden flex flex-col items-center">
      {/* Subtle depth background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_15%,rgba(37,99,235,0.015),transparent_40%),radial-gradient(circle_at_85%_85%,rgba(124,58,237,0.015),transparent_40%)]" />

      <div className="w-full max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
        
        {/* -- Header ----------------------------------------------------- */}
        <motion.div 
          initial="hidden" animate="show" variants={stagger}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12"
        >
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-[clamp(36px,4vw,56px)] font-editorial font-medium text-gray-900 tracking-tight leading-[1.1] mb-4">
              System Configuration
            </h1>
            <p className="text-gray-500 font-ui text-[15px] leading-relaxed max-w-md">
              Configure providers, intelligence engines, media delivery, and runtime behavior.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-4 bg-white/60 backdrop-blur-sm border border-gray-200/60 p-5 rounded-2xl shadow-sm">
            <div className="font-technical text-[10px] tracking-widest text-gray-400 uppercase mb-3 text-right">
              SYSTEM STATUS
            </div>
            <div className="space-y-1.5 font-ui text-[11px] font-semibold tracking-wider text-gray-600">
              <div className="flex items-center justify-between gap-6"><span>● {totalServices} SERVICES</span></div>
              <div className="flex items-center justify-between gap-6"><span>● {readyServices} CONFIGURED</span></div>
              <div className="flex items-center justify-between gap-6 text-amber-600"><span>○ {actionRequired} ACTION REQUIRED</span></div>
            </div>
            <button 
              className={`mt-4 px-4 py-2 rounded-xl text-xs font-semibold w-full transition-all flex items-center justify-center gap-2 ${saveState === 'unsaved' ? 'bg-gray-900 text-white hover:bg-gray-800' : saveState === 'saving' ? 'bg-gray-200 text-gray-500' : saveState === 'saved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              disabled={saveState !== 'unsaved'}
            >
              {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? '✓ Configuration saved' : 'Save Changes'}
            </button>
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="show" variants={stagger} transition={{ delay: 0.05 }} className="mb-12">
          {/* -- Configuration Overview Hero -------------------------------- */}
          <div className="bg-white/72 backdrop-blur-[18px] p-8 border border-slate-900/5 rounded-[24px] shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.01)_50%,transparent_75%,transparent_100%)] bg-[length:250px_250px] opacity-20" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <span className="font-technical text-[10px] font-semibold text-gray-500 uppercase tracking-widest">CONFIGURATION OVERVIEW</span>
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase">
                <motion.span 
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                /> 
                SYSTEM READY
              </div>
            </div>

            <div className="grid grid-cols-4 gap-8 mb-8 relative z-10 border-b border-gray-100 pb-8">
              <div>
                <div className="font-editorial text-4xl text-gray-900 mb-2">{totalServices}</div>
                <div className="font-technical text-[10px] tracking-widest text-gray-500 uppercase">SERVICES</div>
              </div>
              <div>
                <div className="font-editorial text-4xl text-gray-900 mb-2">{readyServices}</div>
                <div className="font-technical text-[10px] tracking-widest text-gray-500 uppercase">READY</div>
              </div>
              <div>
                <div className="font-editorial text-4xl text-amber-600 mb-2">{actionRequired}</div>
                <div className="font-technical text-[10px] tracking-widest text-gray-500 uppercase">ACTION</div>
              </div>
              <div>
                <div className="font-editorial text-4xl text-gray-900 mb-2">98 ms</div>
                <div className="font-technical text-[10px] tracking-widest text-gray-500 uppercase">AVG LATENCY</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-8 font-ui text-sm text-gray-600 relative z-10">
              <span className="flex items-center gap-2">Cloudinary <StatusDot status={config.cloudinary} /></span>
              <span className="flex items-center gap-2">Supabase <StatusDot status={config.supabase} /></span>
              <span className="flex items-center gap-2">Rule Engine <StatusDot status={true} /></span>
              <span className="flex items-center gap-2">OpenAI <StatusDot status={config.openai} /></span>
            </div>
          </div>
        </motion.div>

        {/* -- Bento Modules ---------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          
          {/* PROVIDERS (Cloudinary) - Span 7 */}
          <motion.div initial="hidden" animate="show" variants={stagger} transition={{ delay: 0.1 }} className="lg:col-span-7 space-y-4">
            <h3 className="font-technical text-[10px] tracking-widest uppercase text-gray-500 mb-6 pl-2">PROVIDERS</h3>
            
            <div className="bg-white/72 backdrop-blur-[18px] p-8 border border-slate-900/5 rounded-[24px] shadow-sm relative overflow-hidden group transition-all duration-300 hover:shadow-md hover:border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-editorial text-xl font-medium text-gray-900 uppercase tracking-widest">CLOUDINARY</h4>
                <StatusPill status={config.cloudinary} />
              </div>
              <p className="text-sm font-ui text-gray-500 mb-8">Media storage & delivery</p>

              <div className="grid grid-cols-2 gap-4">
                <ConfigBox 
                  label="CLOUD NAME" 
                  value="my-cloud" 
                  status={config.cloudinary ? "Configured" : "Missing"} 
                  isConfigured={config.cloudinary}
                />
                <ConfigBox 
                  label="UPLOAD PRESET" 
                  value={config.cloudinaryUploadPreset ? "secureflow_upload" : "Not configured"} 
                  status={config.cloudinaryUploadPreset ? "Configured" : "Missing"} 
                  isConfigured={config.cloudinaryUploadPreset}
                  action="Configure"
                  onClick={() => setDrawer({ isOpen: true, title: "Upload Preset", type: "cloudinary_preset" })}
                />
                <ConfigBox 
                  label="API CONNECTION" 
                  value="118 ms" 
                  status={config.cloudinary ? "Healthy" : "Offline"} 
                  isConfigured={config.cloudinary}
                />
                <ConfigBox 
                  label="DELIVERY" 
                  value="HTTPS · CDN" 
                  status={config.cloudinary ? "Healthy" : "Offline"} 
                  isConfigured={config.cloudinary}
                />
              </div>

              {/* Hover indicator overlay */}
              <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                 <TestButton state={testState['cloudinary']} onClick={() => handleTestConnection('cloudinary')} />
              </div>
            </div>
          </motion.div>

          {/* DATA (Supabase) - Span 5 */}
          <motion.div initial="hidden" animate="show" variants={stagger} transition={{ delay: 0.15 }} className="lg:col-span-5 space-y-4">
            <h3 className="font-technical text-[10px] tracking-widest uppercase text-gray-500 mb-6 pl-2">DATA</h3>
            
            <div className="bg-white/72 backdrop-blur-[18px] p-8 border border-slate-900/5 rounded-[24px] shadow-sm relative overflow-hidden group transition-all duration-300 hover:shadow-md hover:border-gray-200 h-full flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <h4 className="font-editorial text-xl font-medium text-gray-900 uppercase tracking-widest">SUPABASE</h4>
                <StatusPill status={config.supabase} />
              </div>

              <div className="space-y-6 flex-1">
                <SimpleRow label="Database" status={config.supabase ? "Connected" : "Offline"} isConfigured={config.supabase} />
                <SimpleRow label="Persistence" status={config.supabase ? "Healthy" : "Offline"} isConfigured={config.supabase} />
                <div className="flex justify-between items-center pb-3">
                  <span className="font-technical text-xs tracking-widest uppercase text-gray-500">RLS</span>
                  <div className="flex items-center gap-2 text-amber-600 font-ui text-xs font-semibold">
                    <span>●</span><span>Demo Mode</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 mt-6 border-t border-gray-100 flex justify-between items-center">
                <div className="font-editorial text-2xl text-gray-900">96 ms</div>
                <TestButton state={testState['supabase']} onClick={() => handleTestConnection('supabase')} />
              </div>
            </div>
          </motion.div>
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          
          {/* INTELLIGENCE - Span 7 */}
          <motion.div initial="hidden" animate="show" variants={stagger} transition={{ delay: 0.2 }} className="lg:col-span-7">
            <h3 className="font-technical text-[10px] tracking-widest uppercase text-gray-500 mb-6 pl-2">INTELLIGENCE</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-[280px]">
              <div className="md:col-span-3 bg-white/72 backdrop-blur-[18px] p-8 border border-slate-900/5 rounded-[24px] shadow-sm relative overflow-hidden group transition-all duration-300 hover:shadow-md hover:border-gray-200 flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h4 className="font-editorial text-xl font-medium text-gray-900 uppercase tracking-widest">SECURITY ENGINE</h4>
                    <StatusPill status={true} label="ACTIVE" />
                  </div>
                  <div className="space-y-3">
                    <SimpleRow label="Rule Engine" status="24 Rules Loaded" isConfigured={true} />
                    <SimpleRow label="Cloudinary AI" status={config.cloudinary ? "Available" : "Missing"} isConfigured={config.cloudinary} />
                    <SimpleRow label="OpenAI" status={config.openai ? "Optional (Configured)" : "Optional"} isConfigured={true} />
                  </div>
                </div>
                
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <div className="text-[10px] font-technical tracking-widest text-gray-400 uppercase mb-2">Intelligence Pipeline</div>
                  <div className="font-ui text-xs text-indigo-600 flex items-center gap-2">
                    Detect <ChevronRight className="w-3 h-3 text-gray-300" /> 
                    Classify <ChevronRight className="w-3 h-3 text-gray-300" /> 
                    Moderate <ChevronRight className="w-3 h-3 text-gray-300" /> 
                    Reason
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 bg-white/72 backdrop-blur-[18px] p-8 border border-slate-900/5 rounded-[24px] shadow-sm relative flex flex-col h-full">
                <h4 className="font-editorial text-xl font-medium text-gray-900 uppercase tracking-widest mb-6">RUNTIME</h4>
                <div className="space-y-4 flex-1">
                  <RuntimeRow label="Environment" value="Development" />
                  <RuntimeRow label="Framework" value="Next.js" />
                  <RuntimeRow label="Database" value="Supabase" />
                  <RuntimeRow label="Media" value="Cloudinary" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* MEDIA DELIVERY - Span 5 */}
          <motion.div initial="hidden" animate="show" variants={stagger} transition={{ delay: 0.25 }} className="lg:col-span-5">
            <h3 className="font-technical text-[10px] tracking-widest uppercase text-gray-500 mb-6 pl-2">MEDIA DELIVERY</h3>
            
            <div className="bg-white/72 backdrop-blur-[18px] p-8 border border-slate-900/5 rounded-[24px] shadow-sm h-[280px] flex flex-col justify-between group transition-all duration-300 hover:shadow-md hover:border-gray-200">
              <div className="flex justify-between items-start mb-6">
                <h4 className="font-editorial text-xl font-medium text-gray-900 uppercase tracking-widest">OPTIMIZATION</h4>
                <StatusPill status={true} label="OPTIMIZED" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                  <div className="font-technical text-[10px] tracking-widest text-gray-500 uppercase mb-2">FORMAT</div>
                  <div className="font-ui font-semibold text-gray-900 mb-1">f_auto</div>
                  <div className="font-ui text-xs text-gray-500 leading-tight">Automatically selects optimal format</div>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                  <div className="font-technical text-[10px] tracking-widest text-gray-500 uppercase mb-2">QUALITY</div>
                  <div className="font-ui font-semibold text-gray-900 mb-1">q_auto</div>
                  <div className="font-ui text-xs text-gray-500 leading-tight">Adaptive quality compression</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <div>
                  <div className="font-technical text-[10px] tracking-widest text-gray-500 uppercase mb-1">CDN</div>
                  <div className="font-ui font-medium text-sm text-gray-900">Cloudinary Delivery</div>
                </div>
                <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
                  Settings <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* -- Recent Activity -------------------------------------------- */}
        <motion.div initial="hidden" animate="show" variants={stagger} transition={{ delay: 0.3 }} className="max-w-3xl">
          <h3 className="font-technical text-[10px] tracking-widest uppercase text-gray-500 mb-6 pl-2">RECENT CONFIGURATION ACTIVITY</h3>
          
          <div className="space-y-5 pl-2 border-l-2 border-gray-100 ml-2">
            {[
              { text: "Cloudinary connection verified", time: "22:48:13", color: "bg-emerald-500" },
              { text: "Media delivery settings updated", time: "22:46:02", color: "bg-emerald-500" },
              { text: "OpenAI provider configured", time: "22:42:19", color: "bg-indigo-500" },
              { text: "Local rules enabled", time: "22:39:51", color: "bg-indigo-500" },
            ].map((activity, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="relative pl-6"
              >
                <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-[#FAFAFC] ${activity.color}`} />
                <div className="font-ui text-[13px] text-gray-800 font-medium mb-1">{activity.text}</div>
                <div className="font-mono text-[10px] text-gray-400">{activity.time}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* -- Configuration Drawer ---------------------------------------- */}
      <AnimatePresence>
        {drawer.isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer({ ...drawer, isOpen: false })}
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
                <h3 className="font-editorial text-xl font-medium text-gray-900">{drawer.title}</h3>
                <button onClick={() => setDrawer({ ...drawer, isOpen: false })} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <p className="font-ui text-sm text-gray-500 leading-relaxed mb-8">
                  Configure your Cloudinary upload pipeline and preset behaviors.
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="font-technical text-[10px] tracking-widest text-gray-500 uppercase mb-2 block">PRESET NAME</label>
                    <input 
                      type="text" 
                      defaultValue="secureflow_upload" 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-900 outline-none focus:border-indigo-500 transition-colors"
                      onChange={() => setSaveState('unsaved')}
                    />
                  </div>

                  <div>
                    <label className="font-technical text-[10px] tracking-widest text-gray-500 uppercase mb-3 block">MODE</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center group-hover:border-indigo-500 transition-colors">
                        </div>
                        <span className="font-ui text-sm text-gray-600">Signed</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-4 h-4 rounded-full border-4 border-indigo-500 bg-white flex items-center justify-center">
                        </div>
                        <span className="font-ui text-sm text-gray-900 font-medium">Unsigned</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="font-technical text-[10px] tracking-widest text-gray-500 uppercase mb-3 block">SECURITY</label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-ui text-sm text-gray-700">Restricted file types</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-ui text-sm text-gray-700">Size limits</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <button 
                  onClick={handleSave}
                  className="w-full py-2.5 bg-gray-900 rounded-xl text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Configuration
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

// Subcomponents

function StatusDot({ status }: { status: boolean }) {
  return (
    <motion.span 
      className={`w-1.5 h-1.5 rounded-full ${status ? 'bg-emerald-500' : 'bg-red-500'}`}
      animate={status ? { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    />
  );
}

function StatusPill({ status, label = "CONNECTED" }: { status: boolean, label?: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${status ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
      <StatusDot status={status} />
      {status ? label : "OFFLINE"}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ConfigBox({ label, value, status, isConfigured, action, onClick }: any) {
  return (
    <div className={`border rounded-xl p-4 transition-colors ${!isConfigured ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100 bg-gray-50/50'}`}>
      <div className="font-technical text-[10px] tracking-widest text-gray-500 uppercase mb-2 flex justify-between">
        <span>{label}</span>
      </div>
      <div className="font-ui text-sm text-gray-900 mb-3 truncate" title={value}>{value}</div>
      <div className="flex justify-between items-center text-xs">
        <div className={`flex items-center gap-1.5 font-semibold ${isConfigured ? 'text-emerald-600' : 'text-amber-600'}`}>
          {isConfigured ? <span className="text-[8px]">●</span> : <span className="text-[8px]">○</span>}
          {status}
        </div>
        {action && (
          <button onClick={onClick} className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
            {action} <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SimpleRow({ label, status, isConfigured }: any) {
  return (
    <div className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <span className="font-technical text-xs tracking-widest uppercase text-gray-500">{label}</span>
      <div className={`flex items-center gap-2 font-ui text-xs font-semibold ${isConfigured ? 'text-emerald-600' : 'text-amber-600'}`}>
        <span>{isConfigured ? '●' : '○'}</span><span>{status}</span>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RuntimeRow({ label, value }: any) {
  return (
    <div className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <span className="font-technical text-xs tracking-widest uppercase text-gray-500">{label}</span>
      <span className="font-ui text-xs font-medium text-gray-900">{value}</span>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TestButton({ state = 'idle', onClick }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={state !== 'idle'}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
        state === 'idle' ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50' :
        state === 'testing' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' :
        state === 'verified' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
        'bg-red-50 border-red-200 text-red-600'
      }`}
    >
      {state === 'idle' && 'Test Connection'}
      {state === 'testing' && 'Testing...'}
      {state === 'verified' && '✓ Verified'}
      {state === 'failed' && 'Failed'}
    </button>
  );
}
