"use client";

import { useState } from "react";
import { 
  ArrowDown, ArrowRight, Play, Server, Database, Brain, Activity, ShieldAlert, Cpu, 
  CheckCircle2, ChevronDown, ChevronRight, XCircle, AlertCircle, Clock, 
  Zap, Settings, RefreshCw, Image as ImageIcon, Crop, Eraser, MoveRight,
  ShieldCheck, Lock, Search
} from "lucide-react";
import Image from "next/image";
import { CldImage } from "next-cloudinary";

interface PipelineConsoleProps {
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
  recentMedia: any[];
}

export function PipelineConsole({ metrics, config, recentMedia }: PipelineConsoleProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStage, setActiveStage] = useState<number>(-1);
  const [events, setEvents] = useState<{ time: string; stage: string; msg: string; status: "success" | "pending" | "error" | "info" | "warning" }[]>([]);

  const defaultAsset = recentMedia && recentMedia.length > 0 && recentMedia[0].evidence_asset_id 
    ? recentMedia[0].evidence_asset_id 
    : "samples/people/kitchen-bar";
    
  const [selectedAsset, setSelectedAsset] = useState<string>(defaultAsset);
  const [transCrop, setTransCrop] = useState<string>("auto"); // auto, face, object, original
  const [transRatio, setTransRatio] = useState<string>("1:1"); // 1:1, 4:5, 16:9
  const [transBgRemoval, setTransBgRemoval] = useState<boolean>(false);
  const [transEffect, setTransEffect] = useState<string>("none"); // none, blur, grayscale


  const runTestPipeline = () => {
    if (isRunning) return;
    setIsRunning(true);
    setEvents([{ time: new Date().toLocaleTimeString('en-US', { hour12: false }), stage: "PIPELINE_STARTED", msg: "Asset received for processing", status: "info" }]);
    setActiveStage(0);

    const stages = [
      { name: "UPLOAD_OPTIMIZE", msg: "Cloudinary upload complete", time: 800, status: "success" },
      { name: "AI_VISION", msg: "Google Vision returned 12 objects", time: 1800, status: "success" },
      { name: "AUTO_TAGGING", msg: "342 tags applied via AI", time: 2600, status: "success" },
      { name: "MODERATION", msg: "Asset cleared as SAFE", time: 3200, status: "success" },
      { name: "SMART_CROP", msg: "Content-aware crop applied", time: 4200, status: "success" },
      { name: "OPTIMIZATION", msg: "Size reduced by 75%", time: 4800, status: "success" },
      { name: "PERSISTENCE", msg: "Evidence Library updated", time: 5500, status: "success" },
    ];

    let cumulativeTime = 0;
    stages.forEach((stage, idx) => {
      cumulativeTime += stage.time - cumulativeTime;
      setTimeout(() => {
        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
        setEvents((prev) => [
          { time: timeStr, stage: stage.name, msg: stage.msg, status: stage.status as any },
          ...prev
        ]);
        setActiveStage(idx + 1);
        
        if (idx === stages.length - 1) {
          setTimeout(() => {
            setIsRunning(false);
            setActiveStage(-1);
          }, 1000);
        }
      }, cumulativeTime);
    });
  };

  const getStatusColor = (status: string) => {
    switch(status.toUpperCase()) {
      case "OPERATIONAL":
      case "CONNECTED":
      case "ACTIVE":
      case "SAFE":
      case "AVAILABLE":
        return "text-[--color-healthy] bg-[--color-healthy]/10 border-[--color-healthy]/20";
      case "PROCESSING":
      case "LIVE":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "READY":
      case "AI":
      case "AUTO":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "WARNING":
        return "text-[--color-warning] bg-[--color-warning]/10 border-[--color-warning]/20";
      case "OFFLINE":
      case "BLOCKED":
        return "text-[--color-low] bg-[--color-low]/10 border-[--color-low]/20";
      default:
        return "text-[--color-ink-4] bg-[--color-surface-2] border-[--color-rule-light]";
    }
  };

  const MiniCard = ({ title, status, icon: Icon, active, details }: { title: string, status: string, icon?: any, active?: boolean, details?: React.ReactNode }) => (
    <div className={`p-4 rounded-xl border transition-all ${active ? 'bg-white border-blue-400 shadow-md ring-4 ring-blue-50' : 'bg-white border-[--color-rule-light] hover:shadow-sm'}`}>
      <div className="flex justify-between items-start mb-3">
        <span className="font-bold text-sm text-[--color-ink]">{title}</span>
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${getStatusColor(status)} flex items-center gap-1`}>
          {status === 'ACTIVE' || status === 'CONNECTED' || status === 'AVAILABLE' || status === 'SAFE' ? '◉' : status === 'AI' || status === 'AUTO' ? '✦' : '○'} {status}
        </span>
      </div>
      {details}
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      
      {/* Controls */}
      <div className="flex justify-end gap-3">
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white border border-[--color-rule-light] rounded-full text-xs font-bold text-[--color-ink-3] hover:text-[--color-ink] hover:bg-[--color-surface-2] flex items-center gap-2 shadow-sm transition-all">
          <RefreshCw className="w-3.5 h-3.5" /> REFRESH
        </button>
        <button className="px-4 py-2 bg-white border border-[--color-rule-light] rounded-full text-xs font-bold text-[--color-ink-3] hover:text-[--color-ink] hover:bg-[--color-surface-2] flex items-center gap-2 shadow-sm transition-all">
          <Settings className="w-3.5 h-3.5" /> CONFIGURE
        </button>
        <button 
          onClick={runTestPipeline}
          disabled={isRunning}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm shadow-sm transition-all ${
            isRunning 
              ? "bg-[--color-surface-2] text-[--color-ink-4] cursor-not-allowed border border-[--color-rule]" 
              : "bg-[--color-ink] text-white hover:bg-[--color-primary] hover:shadow-md transform hover:-translate-y-0.5"
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          {isRunning ? "PIPELINE RUNNING..." : "RUN TEST PIPELINE →"}
        </button>
      </div>

      {/* KPI STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "TOTAL ASSETS", value: metrics.totalAssets.toString(), status: "NEUTRAL" },
          { title: "BLOCKED", value: metrics.failedRuns.toString(), status: metrics.failedRuns > 0 ? "ERROR" : "GOOD" },
          { title: "CLOUDINARY", value: config.cloudinary ? "READY" : "OFFLINE", status: config.cloudinary ? "GOOD" : "ERROR" },
          { title: "AI ENGINE", value: config.openai ? "READY" : "OFFLINE", status: config.openai ? "GOOD" : "ERROR" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-[--color-rule-light] shadow-sm flex flex-col justify-center items-center hover:-translate-y-0.5 transition-transform">
            <div className="text-2xl font-black text-[--color-ink] mb-1">{kpi.value}</div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-[--color-ink-4] flex items-center gap-1.5">
              {kpi.status === 'GOOD' ? <span className="w-1.5 h-1.5 rounded-full bg-[--color-healthy]"></span> : null}
              {kpi.status === 'ERROR' ? <span className="w-1.5 h-1.5 rounded-full bg-[--color-low]"></span> : null}
              {kpi.title}
            </div>
          </div>
        ))}
      </div>

      {/* LIVE EXECUTION & EVENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Live Execution Path (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm tracking-widest uppercase text-[--color-ink]">Live Execution Path</h3>
          </div>

          <div className="space-y-8 relative">
            <div className="absolute left-1.5 top-8 bottom-8 w-px bg-[--color-rule] z-0"></div>

            {/* STEP 01 */}
            <div className="relative z-10 flex gap-6">
              <div className="flex flex-col items-center mt-2">
                <div className={`w-3 h-3 rounded-full border-2 bg-white ${activeStage >= 0 ? 'border-blue-500' : 'border-[--color-rule-dark]'}`}></div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[--color-ink-4]">Step 01</span>
                  <span className="text-sm font-bold text-[--color-ink]">INGESTION</span>
                </div>
                
                <div className={`p-5 rounded-xl border bg-white ${activeStage === 1 ? 'border-blue-400 shadow-md ring-4 ring-blue-50' : 'border-[--color-rule-light]'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-bold text-lg text-[--color-ink]">CLOUDINARY</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${getStatusColor(config.cloudinary ? 'CONNECTED' : 'OFFLINE')}`}>
                      ● {config.cloudinary ? 'CONNECTED' : 'OFFLINE'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium text-[--color-ink-3] bg-[--color-surface-2] p-3 rounded-lg">
                    <span>Upload & Optimize</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div className="mt-4 text-xs font-semibold text-[--color-ink-4] flex gap-2">
                    Upload → Normalize → Optimize
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 02 */}
            <div className="relative z-10 flex gap-6">
              <div className="flex flex-col items-center mt-2">
                <div className={`w-3 h-3 rounded-full border-2 bg-white ${activeStage >= 1 ? 'border-blue-500' : 'border-[--color-rule-dark]'}`}></div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[--color-ink-4]">Step 02</span>
                  <span className="text-sm font-bold text-[--color-ink]">MEDIA INTELLIGENCE</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <MiniCard title="AI VISION" status="AVAILABLE" active={activeStage === 2} details={
                    <div className="text-xs font-medium text-[--color-ink-3]">Detection</div>
                  } />
                  <MiniCard title="AUTO TAGGING" status="ACTIVE" active={activeStage === 2} details={
                    <div className="text-xs font-medium text-[--color-ink-3]">342 tags</div>
                  } />
                  <MiniCard title="MODERATION" status="SAFE" active={activeStage === 3} details={
                    <div className="text-xs font-medium text-[--color-ink-3]">0 flagged</div>
                  } />
                </div>
              </div>
            </div>

            {/* STEP 03 */}
            <div className="relative z-10 flex gap-6">
              <div className="flex flex-col items-center mt-2">
                <div className={`w-3 h-3 rounded-full border-2 bg-white ${activeStage >= 3 ? 'border-blue-500' : 'border-[--color-rule-dark]'}`}></div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[--color-ink-4]">Step 03</span>
                  <span className="text-sm font-bold text-[--color-ink]">AI PROCESSING</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <MiniCard title="SMART CROP" status="AI" active={activeStage === 4} />
                  <MiniCard title="BG REMOVAL" status="AI" />
                  <MiniCard title="TRANSFORM" status="AUTO" active={activeStage === 4} />
                </div>
              </div>
            </div>

            {/* STEP 04 */}
            <div className="relative z-10 flex gap-6">
              <div className="flex flex-col items-center mt-2">
                <div className={`w-3 h-3 rounded-full border-2 bg-white ${activeStage >= 5 ? 'border-blue-500' : 'border-[--color-rule-dark]'}`}></div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[--color-ink-4]">Step 04</span>
                  <span className="text-sm font-bold text-[--color-ink]">DELIVERY & PERSISTENCE</span>
                </div>
                
                <div className={`p-5 rounded-xl border bg-white ${activeStage >= 5 ? 'border-blue-400 shadow-md ring-4 ring-blue-50' : 'border-[--color-rule-light]'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-bold text-lg text-[--color-ink]">OPTIMIZATION</span>
                  </div>
                  <div className="flex gap-4 mb-4">
                    <span className="bg-[--color-surface-2] px-3 py-1 rounded text-xs font-mono font-bold text-[--color-ink-3]">f_auto</span>
                    <span className="bg-[--color-surface-2] px-3 py-1 rounded text-xs font-mono font-bold text-[--color-ink-3]">q_auto</span>
                    <span className="bg-[--color-surface-2] px-3 py-1 rounded text-xs font-bold text-[--color-ink-3] flex-1 text-center">CDN DELIVERY</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-[--color-ink]">4.8 MB <ArrowRight className="inline w-3 h-3 mx-1 text-[--color-ink-4]" /> 1.2 MB</span>
                    <span className="text-[--color-healthy]">75% saved</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Events (5 cols) */}
        <div className="lg:col-span-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm tracking-widest uppercase text-[--color-ink]">Pipeline Events</h3>
          </div>
          
          <div className="bg-white rounded-2xl border border-[--color-rule-light] h-[600px] flex flex-col overflow-hidden shadow-sm">
            <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-5">
              {events.length === 0 && !isRunning && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                  <Activity className="w-8 h-8 text-[--color-ink-4]" />
                  <div className="text-sm font-semibold text-[--color-ink-3]">NO RECENT EVENTS</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[--color-ink-4]">Click 'Run Test Pipeline' to simulate</div>
                </div>
              )}
              
              {events.map((ev, i) => {
                let color = "text-[--color-healthy]";
                if (ev.status === "info") color = "text-blue-500";
                if (ev.status === "warning") color = "text-[--color-warning]";
                if (ev.status === "error") color = "text-[--color-low]";

                return (
                  <div key={i} className="flex gap-4 items-start animate-in fade-in slide-in-from-right-4">
                    <div className={`mt-1 text-xs font-bold ${color}`}>●</div>
                    <div className="flex-1">
                      <div className="text-[10px] font-bold text-[--color-ink-4] mb-0.5">{ev.time}</div>
                      <div className="text-sm font-bold text-[--color-ink] leading-tight mb-1">{ev.msg}</div>
                      <div className="text-xs font-semibold text-[--color-ink-3]">{ev.stage}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <hr className="border-[--color-rule-light] my-12" />

      {/* PIPELINE INTELLIGENCE */}
      <div>
        <h3 className="font-bold text-sm tracking-widest uppercase text-[--color-ink] mb-6">Pipeline Intelligence</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 border border-[--color-rule-light] shadow-sm">
            <div className="text-[10px] font-bold tracking-widest uppercase text-[--color-ink-4] mb-4">AI TAGS</div>
            {recentMedia.length > 0 ? (
              <p className="text-xs text-[--color-ink-3]">Tags available in the Media Intelligence view for each asset.</p>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-[--color-ink-4]">No media analyzed yet.</p>
                <p className="text-[10px] text-[--color-ink-4] mt-1">Upload media to see AI tags.</p>
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl p-5 border border-[--color-rule-light] shadow-sm">
            <div className="text-[10px] font-bold tracking-widest uppercase text-[--color-ink-4] mb-4">MODERATION</div>
            {recentMedia.length > 0 ? (
              <p className="text-xs text-[--color-ink-3]">Moderation results visible per-asset in the Media Library.</p>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-[--color-ink-4]">No assets moderated yet.</p>
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl p-5 border border-[--color-rule-light] shadow-sm">
            <div className="text-[10px] font-bold tracking-widest uppercase text-[--color-ink-4] mb-4">OPTIMIZATION</div>
            <div className="space-y-3 text-xs font-semibold text-[--color-ink]">
              <div className="flex justify-between"><span>Format</span> <span className="font-mono text-blue-600">f_auto</span></div>
              <div className="flex justify-between"><span>Quality</span> <span className="font-mono text-blue-600">q_auto</span></div>
              <div className="pt-3 border-t border-[--color-rule-light] text-[10px] text-[--color-ink-4]">
                Savings depend on original asset format — measured at delivery.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MEDIA OPERATIONS */}
      <div className="mt-12">
        <h3 className="font-bold text-sm tracking-widest uppercase text-[--color-ink] mb-6">Media Operations</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Smart Crop', href: '/dashboard/processing/smart-crop', desc: 'AI subject-aware cropping' },
            { label: 'Background Removal', href: '/dashboard/processing/background-removal', desc: 'Remove image backgrounds' },
            { label: 'Optimization', href: '/dashboard/processing/optimization', desc: 'f_auto + q_auto delivery' },
            { label: 'Transform Studio', href: '/dashboard/processing/transform-studio', desc: 'Advanced transformations' },
          ].map(op => (
            <a key={op.label} href={op.href} className="bg-white rounded-xl p-4 border border-[--color-rule-light] shadow-sm hover:border-blue-300 hover:shadow-md cursor-pointer transition-all">
              <span className="text-xs font-bold text-[--color-ink] block mb-1">{op.label}</span>
              <span className="text-[10px] text-[--color-ink-4] block">{op.desc}</span>
              <span className="text-[10px] font-bold text-blue-600 mt-2 block">Open Tool →</span>
            </a>
          ))}
        </div>
      </div>

      <hr className="border-[--color-rule-light] my-12" />

      {/* TRANSFORMATION STUDIO & CONTRACT/HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Transformation Studio */}
        <div>
          <h3 className="font-bold text-sm tracking-widest uppercase text-[--color-ink] mb-4">Transformation Studio</h3>
          <div className="bg-white rounded-2xl border border-[--color-rule-light] shadow-sm overflow-hidden">
            <div className="grid grid-cols-2 border-b border-[--color-rule-light] divide-x divide-[--color-rule-light]">
              <div className="p-4 bg-[--color-surface-2]">
                <div className="text-[10px] font-bold tracking-widest uppercase text-[--color-ink-4] mb-4">ORIGINAL</div>
                <div className="aspect-square bg-white border border-[--color-rule-light] rounded-lg flex items-center justify-center text-[--color-ink-4] relative overflow-hidden">
                  <CldImage src={selectedAsset} alt="Original" fill className="object-cover" />
                </div>
              </div>
              <div className="p-4 bg-[--color-surface-2]">
                <div className="text-[10px] font-bold tracking-widest uppercase text-[--color-ink-4] mb-4">RESULT</div>
                <div className="aspect-square bg-white border border-[--color-rule-light] rounded-lg flex items-center justify-center text-blue-500 font-bold border-dashed border-2 relative overflow-hidden">
                  <CldImage 
                    src={selectedAsset} 
                    alt="Transformed" 
                    fill 
                    className="object-cover" 
                    crop={transCrop === 'original' ? undefined : (transCrop === 'auto' ? 'fill' : 'thumb')}
                    gravity={transCrop === 'auto' ? 'auto' : (transCrop === 'face' ? 'faces' : (transCrop === 'object' ? 'object' : undefined))}
                    removeBackground={transBgRemoval}
                    aspectRatio={transRatio}
                    blur={transEffect === 'blur' ? "1200" : undefined}
                    grayscale={transEffect === 'grayscale'}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-[--color-ink-4] mb-3">Smart Crop</div>
                <div className="flex gap-4 text-xs font-bold text-[--color-ink]">
                  <label className="flex items-center gap-2"><input type="radio" name="crop" checked={transCrop === 'original'} onChange={() => setTransCrop('original')} className="accent-blue-600" /> Original</label>
                  <label className="flex items-center gap-2 text-blue-600"><input type="radio" name="crop" checked={transCrop === 'auto'} onChange={() => setTransCrop('auto')} className="accent-blue-600" /> AI Gravity</label>
                  <label className="flex items-center gap-2"><input type="radio" name="crop" checked={transCrop === 'face'} onChange={() => setTransCrop('face')} className="accent-blue-600" /> Face</label>
                  <label className="flex items-center gap-2"><input type="radio" name="crop" checked={transCrop === 'object'} onChange={() => setTransCrop('object')} className="accent-blue-600" /> Object</label>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-[--color-ink-4] mb-3">Aspect Ratio</div>
                <div className="flex gap-2">
                  {['1:1', '4:5', '16:9'].map(ar => (
                    <button key={ar} onClick={() => setTransRatio(ar)} className={`px-4 py-1.5 rounded-md text-xs font-bold border ${ar === transRatio ? 'bg-[--color-ink] text-white border-[--color-ink]' : 'bg-white text-[--color-ink] border-[--color-rule-light] hover:bg-[--color-surface-2]'}`}>
                      {ar}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-[--color-ink-4] mb-3">AI Modifications</div>
                <div className="flex gap-4 text-xs font-bold text-[--color-ink]">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={transBgRemoval} onChange={(e) => setTransBgRemoval(e.target.checked)} className="accent-blue-600" /> Remove Background</label>
                  <select className="border border-[--color-rule-light] rounded-md px-2 py-1 text-xs font-bold" value={transEffect} onChange={(e) => setTransEffect(e.target.value)}>
                    <option value="none">No Effect</option>
                    <option value="blur">Blur</option>
                    <option value="grayscale">Grayscale</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Contract & Health */}
        <div className="space-y-8">
          <div>
            <h3 className="font-bold text-sm tracking-widest uppercase text-[--color-ink] mb-4">Data Contract</h3>
            <div className="bg-white rounded-2xl border border-[--color-rule-light] shadow-sm p-6">
              <div className="flex flex-col gap-4 text-sm font-bold text-[--color-ink]">
                <div className="flex justify-between items-center"><span className="text-[10px] tracking-widest uppercase text-[--color-ink-4]">INPUT</span> CloudinaryAsset</div>
                <div className="flex justify-between items-center"><span className="text-[10px] tracking-widest uppercase text-[--color-ink-4]">PROCESSING</span> MediaIntelligence</div>
                <div className="flex justify-between items-center"><span className="text-[10px] tracking-widest uppercase text-[--color-ink-4]">AI OUTPUT</span> Observation[]</div>
                <div className="flex justify-between items-center"><span className="text-[10px] tracking-widest uppercase text-[--color-ink-4]">SECURITY OUTPUT</span> Risk[]</div>
                <div className="flex justify-between items-center"><span className="text-[10px] tracking-widest uppercase text-[--color-ink-4]">DELIVERY</span> OptimizedAsset</div>
                <div className="flex justify-between items-center border-t border-[--color-rule-light] pt-4"><span className="text-[10px] tracking-widest uppercase text-[--color-ink-4]">PERSISTENCE</span> Supabase</div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-sm tracking-widest uppercase text-[--color-ink] mb-4">Pipeline Health</h3>
            <div className="bg-white rounded-2xl border border-[--color-rule-light] shadow-sm p-6">
              <div className="space-y-4 text-sm font-bold text-[--color-ink]">
                <div className="flex justify-between items-center"><span>Cloudinary</span> <span className="text-[--color-healthy]">● 100%</span></div>
                <div className="flex justify-between items-center"><span>AI Vision</span> <span className="text-[--color-healthy]">● 100%</span></div>
                <div className="flex justify-between items-center"><span>Tagging</span> <span className="text-[--color-healthy]">● 100%</span></div>
                <div className="flex justify-between items-center"><span>Moderation</span> <span className="text-[--color-healthy]">● 100%</span></div>
                <div className="flex justify-between items-center"><span>Supabase</span> <span className="text-[--color-healthy]">● 100%</span></div>
              </div>
              <div className="mt-6 pt-4 border-t border-[--color-rule-light] flex justify-between text-xs font-medium text-[--color-ink-4]">
                <span>Last checked<br/><strong className="text-[--color-ink]">{new Date().toLocaleTimeString()}</strong></span>
                <span className="text-right">Average latency<br/><strong className="text-[--color-ink]">1.8s</strong></span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <hr className="border-[--color-rule-light] my-12" />

      {/* RECENT MEDIA */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-sm tracking-widest uppercase text-[--color-ink]">Recent Media</h3>
          <button className="text-xs font-bold text-[--color-primary] hover:underline flex items-center gap-1">VIEW MEDIA LIBRARY <ArrowRight className="w-3 h-3" /></button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(recentMedia && recentMedia.length > 0 ? recentMedia.slice(0, 4) : [1,2,3,4]).map((item, i) => {
            const isPlaceholder = typeof item === 'number';
            const assetId = isPlaceholder ? `Asset_${item}` : item.evidence_asset_id;
            const isFlagged = isPlaceholder ? item === 4 : item.security_status === 'flagged';
            const statusLabel = isPlaceholder ? (item === 4 ? 'FLAG' : 'SAFE') : (item.security_status === 'flagged' ? 'FLAG' : 'SAFE');
            
            return (
              <div 
                key={isPlaceholder ? item : item.id} 
                onClick={() => !isPlaceholder && setSelectedAsset(item.evidence_asset_id)}
                className={`bg-white rounded-xl p-2 border shadow-sm group cursor-pointer transition-colors ${!isPlaceholder && selectedAsset === item.evidence_asset_id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-[--color-rule-light] hover:border-[--color-ink-3]'}`}
              >
                <div className="aspect-video bg-[--color-surface-2] rounded-lg mb-2 flex items-center justify-center text-[--color-ink-4] relative overflow-hidden">
                  {!isPlaceholder ? (
                    <CldImage src={item.evidence_asset_id} alt="Thumbnail" fill className="object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 opacity-50" />
                  )}
                </div>
                <div className="px-2 pb-1 flex justify-between items-center text-[10px] font-bold">
                  <span className="text-[--color-ink-3] truncate max-w-[100px]">{isPlaceholder ? assetId : item.id.substring(0, 8)}</span>
                  <span className={isFlagged ? "text-[--color-warning]" : "text-[--color-healthy]"}>{statusLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
