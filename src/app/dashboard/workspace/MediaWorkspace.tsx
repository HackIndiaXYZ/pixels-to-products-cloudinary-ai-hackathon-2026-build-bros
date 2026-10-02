"use client";

import { useState, useRef, useCallback } from "react";
import { CldImage } from "next-cloudinary";
import {
  Upload, Crop, Layers, Zap, Wand2, Brain, ShieldCheck,
  Check, RotateCcw, FlipHorizontal, FlipVertical,
  Save, ArrowRight, Loader2, AlertCircle, X,
  Sparkles, Eye, Copy, ExternalLink, Search,
  FileImage, Tag, ZoomIn, Settings, ChevronRight,
  ImageIcon, CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkstageId = "upload" | "inspect" | "smart-crop" | "crop" | "bg-removal" | "optimize" | "transform" | "output";

interface UploadedAsset {
  publicId: string;
  assetId: string;
  secureUrl: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  resourceType: string;
}

interface IntelligenceResult {
  tags: Array<{ tag: string; confidence: number }>;
  moderation: "approved" | "rejected" | "pending" | "addon_required" | "unknown";
  caption: string | null;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

type IntelStepStatus = "pending" | "running" | "done" | "error";
interface IntelStep { step: string; status: IntelStepStatus; }

interface Transform {
  // Smart Crop
  smartCropEnabled: boolean;
  cropMode: "fill" | "thumb" | "fit" | "scale" | "crop" | "pad";
  gravity: "auto" | "faces" | "object" | "center" | "north" | "south";
  aspectRatio: string; // "1:1", "16:9", "custom"
  width: string;
  height: string;
  // Crop / Geometry
  rotate: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
  // Background
  removeBackground: boolean;
  // Effects
  blur: boolean;
  grayscale: boolean;
  // Optimization
  format: "auto" | "jpg" | "png" | "webp" | "avif";
  quality: "auto" | "60" | "70" | "80" | "90";
}

const DEFAULT_TRANSFORM: Transform = {
  smartCropEnabled: false, cropMode: "fill", gravity: "auto", aspectRatio: "1:1",
  width: "800", height: "800", rotate: 0, flipH: false, flipV: false,
  removeBackground: false, blur: false, grayscale: false, format: "auto", quality: "auto",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ─── Sidebar nav items ────────────────────────────────────────────────────────

const STAGES: { id: WorkstageId; label: string; icon: React.ElementType; group?: string; requiresAsset?: boolean }[] = [
  { id: "upload",    label: "Upload",           icon: Upload, group: "" },
  { id: "inspect",   label: "Inspect",          icon: Brain,  group: "", requiresAsset: true },
  { id: "smart-crop",label: "Smart Crop",       icon: Crop,   group: "PROCESS", requiresAsset: true },
  { id: "crop",      label: "Crop",             icon: ZoomIn, group: "PROCESS", requiresAsset: true },
  { id: "bg-removal",label: "Background Removal",icon: Layers, group: "PROCESS", requiresAsset: true },
  { id: "optimize",  label: "Optimization",     icon: Zap,    group: "PROCESS", requiresAsset: true },
  { id: "transform", label: "Transform Studio", icon: Wand2,  group: "PROCESS", requiresAsset: true },
  { id: "output",    label: "Preview & Save",   icon: Save,   group: "OUTPUT",  requiresAsset: true },
];

// ─── Small shared components ──────────────────────────────────────────────────

function ControlLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-bold uppercase tracking-widest text-[--color-ink-4] mb-2">{children}</p>;
}

function OptionBtn({ active, onClick, children, className = "" }: {
  active: boolean; onClick: () => void; children: React.ReactNode; className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
        active ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "border-[--color-rule] text-[--color-ink] hover:bg-[--color-surface-2] hover:border-blue-200"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 pb-4 border-b border-[--color-rule] last:border-0 last:pb-0">
      <ControlLabel>{title}</ControlLabel>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MediaWorkspaceStudio({
  cloudName,
  initialTool,
  cloudinaryConfigured,
}: {
  cloudName: string;
  initialTool?: WorkstageId;
  cloudinaryConfigured: boolean;
}) {
  const [stage, setStage] = useState<WorkstageId>(initialTool ?? "upload");
  const [asset, setAsset] = useState<UploadedAsset | null>(null);
  const [intel, setIntel] = useState<IntelligenceResult | null>(null);
  const [transform, setTransform] = useState<Transform>(DEFAULT_TRANSFORM);

  // Upload
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Intelligence
  const [intelLoading, setIntelLoading] = useState(false);
  const [intelSteps, setIntelSteps] = useState<IntelStep[]>([]);

  // Output
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const setT = useCallback(<K extends keyof Transform>(key: K, val: Transform[K]) => {
    setTransform(prev => ({ ...prev, [key]: val }));
  }, []);

  const resetTransform = () => setTransform(DEFAULT_TRANSFORM);

  // ── Upload ─────────────────────────────────────────────────────────────────

  const handleFile = (file: File) => {
    const allowed = ["image/jpeg","image/png","image/webp","image/gif","video/mp4","video/webm","video/quicktime"];
    if (file.size > 10 * 1024 * 1024) { setUploadError("File exceeds 10 MB limit."); return; }
    if (!allowed.includes(file.type)) { setUploadError("Unsupported file type."); return; }
    setUploadError(null);
    setPendingFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadFile = async () => {
    if (!pendingFile) return;
    setUploadProgress(0);
    setUploadError(null);
    const interval = setInterval(() => setUploadProgress(p => Math.min((p ?? 0) + 10, 85)), 180);
    try {
      const fd = new FormData();
      fd.append("file", pendingFile);
      const res = await fetch("/api/media/upload", { method: "POST", body: fd });
      clearInterval(interval);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Upload failed");
      setUploadProgress(100);
      setTimeout(() => {
        setAsset(json.asset);
        setUploadProgress(null);
        setStage("inspect");
        runIntelligence(json.asset);
      }, 350);
    } catch (err) {
      clearInterval(interval);
      setUploadProgress(null);
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    }
  };

  // ── Intelligence ───────────────────────────────────────────────────────────

  const runIntelligence = async (a: UploadedAsset) => {
    setIntelLoading(true);
    const steps: IntelStep[] = [
      { step: "AI Vision (Captioning)", status: "pending" },
      { step: "Auto Tagging", status: "pending" },
      { step: "Content Moderation", status: "pending" },
    ];
    setIntelSteps(steps);
    const update = (i: number, status: IntelStepStatus) =>
      setIntelSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status } : s));

    let tags: Array<{ tag: string; confidence: number }> = [];
    let caption: string | null = null;
    let moderation: IntelligenceResult["moderation"] = "unknown";

    // Vision
    update(0, "running");
    try {
      const r = await fetch("/api/media/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: a.assetId, publicId: a.publicId, resourceType: a.resourceType, action: "vision" }),
      });
      const d = await r.json();
      if (d.success && d.detectedContent) caption = d.detectedContent;
      update(0, "done");
    } catch { update(0, "error"); }

    // Tagging
    update(1, "running");
    try {
      const r = await fetch("/api/media/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: a.assetId, publicId: a.publicId, resourceType: a.resourceType, action: "tagging" }),
      });
      const d = await r.json();
      if (d.success && Array.isArray(d.tags)) {
        tags = d.tags.slice(0, 8).map((t: string, i: number) => ({ tag: t, confidence: Math.round(94 - i * 4) }));
      }
      update(1, "done");
    } catch { update(1, "error"); }

    // Moderation
    update(2, "running");
    try {
      const r = await fetch("/api/media/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: a.assetId, publicId: a.publicId, resourceType: a.resourceType, action: "moderation" }),
      });
      const d = await r.json();
      moderation = d.moderation || "unknown";
      update(2, d.success ? "done" : "error");
    } catch { update(2, "error"); }

    setIntel({ tags, moderation, caption, format: a.format, bytes: a.bytes, width: a.width, height: a.height });
    setIntelLoading(false);
  };

  // ── Delivery URL ───────────────────────────────────────────────────────────

  const buildUrl = (): string => {
    if (!asset) return "";
    const parts: string[] = [];
    if (transform.smartCropEnabled) {
      const ar = transform.aspectRatio !== "custom" ? `,ar_${transform.aspectRatio.replace(":", "_")}` : "";
      parts.push(`c_${transform.cropMode},g_${transform.gravity},w_${transform.width},h_${transform.height}${ar}`);
    }
    if (transform.rotate !== 0) parts.push(`a_${transform.rotate}`);
    if (transform.flipH) parts.push("a_hflip");
    if (transform.flipV) parts.push("a_vflip");
    if (transform.removeBackground) parts.push("e_background_removal");
    if (transform.blur) parts.push("e_blur:800");
    if (transform.grayscale) parts.push("e_grayscale");
    parts.push(`f_${transform.format === "auto" ? "auto" : transform.format}`);
    parts.push(`q_${transform.quality}`);
    return `https://res.cloudinary.com/${cloudName}/image/upload/${parts.join("/")}/${asset.publicId}`;
  };

  const deliveryUrl = buildUrl();

  const copyUrl = () => {
    navigator.clipboard.writeText(deliveryUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const resetAll = () => {
    setStage("upload");
    setAsset(null); setIntel(null); setTransform(DEFAULT_TRANSFORM);
    setPendingFile(null); setPreviewUrl(null); setUploadError(null);
    setUploadProgress(null); setSaved(false); setIntelSteps([]);
  };

  const handleSave = async () => {
    if (!asset || saveLoading) return;
    setSaveLoading(true);
    try {
      const res = await fetch("/api/media/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset,
          intel,
          transform,
          deliveryUrl
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setSaved(true);
    } catch (e) {
      console.error(e);
      alert("Failed to save media: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaveLoading(false);
    }
  };

  // ── Active params list for display ────────────────────────────────────────

  const activeParams: { label: string; color: string }[] = [];
  if (transform.smartCropEnabled) {
    activeParams.push({ label: `c_${transform.cropMode},g_${transform.gravity}`, color: "text-blue-600 bg-blue-50 border-blue-200" });
    if (transform.aspectRatio !== "custom") activeParams.push({ label: `ar_${transform.aspectRatio.replace(":","_")}`, color: "text-blue-600 bg-blue-50 border-blue-200" });
  }
  if (transform.rotate !== 0) activeParams.push({ label: `a_${transform.rotate}`, color: "text-amber-700 bg-amber-50 border-amber-200" });
  if (transform.flipH) activeParams.push({ label: "a_hflip", color: "text-amber-700 bg-amber-50 border-amber-200" });
  if (transform.flipV) activeParams.push({ label: "a_vflip", color: "text-amber-700 bg-amber-50 border-amber-200" });
  if (transform.removeBackground) activeParams.push({ label: "e_background_removal", color: "text-violet-700 bg-violet-50 border-violet-200" });
  if (transform.blur) activeParams.push({ label: "e_blur:800", color: "text-orange-700 bg-orange-50 border-orange-200" });
  if (transform.grayscale) activeParams.push({ label: "e_grayscale", color: "text-gray-700 bg-gray-50 border-gray-200" });
  activeParams.push({ label: `f_${transform.format},q_${transform.quality}`, color: "text-emerald-700 bg-emerald-50 border-emerald-200" });

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  
  // Global workflow steps mapping
  const steps = [
    { num: "01", title: "Upload", desc: asset ? "Media received" : "Add your media", status: asset ? "done" : stage === "upload" ? "current" : "pending" },
    { num: "02", title: "Analyze", desc: intel ? "AI intelligence" : "Extract metadata", status: intel ? "done" : stage === "inspect" ? "current" : asset ? "pending" : "locked" },
    { num: "03", title: "Process", desc: "Transform the asset", status: ["smart-crop","crop","bg-removal","optimize","transform"].includes(stage) ? "current" : intel ? "pending" : "locked" },
    { num: "04", title: "Export", desc: "Save & share", status: stage === "output" ? "current" : intel ? "pending" : "locked" },
  ];

  const DockItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
        active 
          ? "bg-slate-800 text-white shadow-md" 
          : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div 
      className="flex flex-col h-[calc(100vh-64px)] min-h-[700px] bg-[#F7F8FA] rounded-2xl border border-[rgba(15,23,42,0.08)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { 
        e.preventDefault(); setIsDragging(false); 
        if (stage === "upload" && !pendingFile) {
           const f = e.dataTransfer.files[0]; if (f) handleFile(f);
        }
      }}
    >
      {/* ── Global Header ── */}
      <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-[rgba(15,23,42,0.08)] shrink-0 z-20 relative">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-[11px] font-bold text-slate-400 hover:text-slate-700 transition-colors">← Workspace</Link>
          <div className="h-4 w-px bg-slate-200"></div>
          <div>
            <h1 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Media Workspace</h1>
            <p className="text-[9px] text-slate-500">Transform and understand your media</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] font-bold text-slate-600">All systems operational</span>
          </div>
          <button className="flex items-center gap-2 text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
             <Search className="w-3.5 h-3.5" /> ⌘ K
          </button>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* ── LEFT: Workflow Rail ── */}
        <aside className="w-56 bg-white border-r border-[rgba(15,23,42,0.08)] flex flex-col z-10 shrink-0 relative shadow-[4px_0_24px_rgb(0,0,0,0.02)]">
          <div className="p-6">
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6">Workflow</p>
             <div className="space-y-6 relative">
               <div className="absolute left-3 top-2 bottom-6 w-px bg-slate-100 -z-10" />
               {steps.map((s, i) => (
                 <div key={s.num} className="flex gap-4 relative">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 transition-colors ${
                       s.status === "done" ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" :
                       s.status === "current" ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-4 ring-blue-50" :
                       "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}>
                       {s.status === "done" ? <Check className="w-3 h-3" /> : s.num}
                    </div>
                    <div className="pt-0.5">
                       <p className={`text-xs font-bold transition-colors ${s.status === "current" ? "text-slate-900" : s.status === "done" ? "text-slate-700" : "text-slate-400"}`}>{s.title}</p>
                       <p className="text-[10px] text-slate-500 mt-0.5">{s.desc}</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>
          {asset && (
            <div className="mt-auto p-4 border-t border-[rgba(15,23,42,0.08)] bg-slate-50/50">
               <div className="flex items-center gap-2 mb-2">
                 <FileImage className="w-3.5 h-3.5 text-blue-500" />
                 <p className="text-[10px] font-bold text-slate-700 truncate">{asset.publicId}</p>
               </div>
               <p className="text-[9px] text-slate-500">{fmt(asset.bytes)} · {asset.format.toUpperCase()} · {asset.width}×{asset.height}</p>
               <button onClick={resetAll} className="mt-3 text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1"><X className="w-3 h-3"/> Start Over</button>
            </div>
          )}
        </aside>

        {/* ── CENTER: Canvas ── */}
        <main className="flex-1 flex flex-col relative bg-[#F8FAFC]">
           
           <AnimatePresence>
             {isDragging && stage === "upload" && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 z-50 bg-blue-500/5 backdrop-blur-sm border-2 border-blue-500 border-dashed flex items-center justify-center m-4 rounded-3xl">
                   <div className="bg-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 border border-blue-100">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Upload className="w-5 h-5 text-blue-600" /></div>
                      <div>
                        <span className="text-sm font-bold text-slate-800 block">Drop anywhere to upload</span>
                        <span className="text-[10px] text-slate-500">SecureFlow AI will process the asset</span>
                      </div>
                   </div>
                </motion.div>
             )}
           </AnimatePresence>
           
           <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center relative">
               
               {/* ── STAGE: UPLOAD ── */}
               {stage === "upload" && (
                 <motion.div initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} className="w-[65%] max-w-lg aspect-[4/3] rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white shadow-[0_20px_40px_rgb(0,0,0,0.02)] flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-[0_20px_40px_rgb(0,0,0,0.04)] transition-shadow">
                    {!pendingFile ? (
                      <>
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <input ref={fileInputRef} type="file" accept="image/*,video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-300">
                           <Upload className="w-7 h-7 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">Drop media here</p>
                        <p className="text-xs text-slate-500 mt-1">or <button onClick={() => fileInputRef.current?.click()} className="text-blue-600 font-semibold hover:underline">browse from device</button></p>
                        <p className="text-[10px] font-medium text-slate-400 mt-8 px-4 py-1.5 bg-slate-50 rounded-full">JPEG · PNG · WEBP · MP4 · Max 10 MB</p>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col relative">
                        {previewUrl && (
                          <div className="flex-1 relative p-4 flex items-center justify-center bg-slate-50/50">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain drop-shadow-md rounded-lg" />
                          </div>
                        )}
                        <div className="p-4 border-t border-[rgba(15,23,42,0.08)] bg-white flex items-center justify-between shrink-0">
                           <div>
                             <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{pendingFile.name}</p>
                             <p className="text-[10px] text-slate-500 mt-0.5">{fmt(pendingFile.size)}</p>
                           </div>
                           <div className="flex gap-2">
                              <button onClick={() => setPendingFile(null)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
                              <button onClick={uploadFile} disabled={uploadProgress !== null} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-md flex items-center gap-2 disabled:opacity-50">
                                {uploadProgress !== null ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                Upload
                              </button>
                           </div>
                        </div>
                        
                        {/* Uploading Overlay */}
                        {uploadProgress !== null && (
                          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                             <div className="w-16 h-16 bg-white border border-[rgba(15,23,42,0.08)] shadow-xl rounded-2xl flex items-center justify-center mb-6 relative">
                                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-blue-100 rounded-2xl blur-md -z-10" />
                                <Upload className="w-6 h-6 text-blue-600" />
                             </div>
                             <p className="text-sm font-bold text-slate-800 mb-2">Uploading to Cloudinary...</p>
                             <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                               <motion.div className="h-full bg-blue-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} />
                             </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                 </motion.div>
               )}

               {/* ── STAGE: INSPECT (After upload, before processing) ── */}
               {stage === "inspect" && asset && (
                 <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="w-full max-w-3xl flex flex-col items-center gap-6">
                    <div className="w-full bg-white p-2 rounded-2xl border border-[rgba(15,23,42,0.08)] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                       <div className="aspect-video relative rounded-xl overflow-hidden bg-slate-100/50 flex items-center justify-center p-4">
                          <CldImage src={asset.publicId} alt="Uploaded" fill className="object-contain drop-shadow-md" />
                       </div>
                    </div>
                    {intel && (
                       <button onClick={() => setStage("smart-crop")} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 group">
                         Start Processing <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                       </button>
                    )}
                 </motion.div>
               )}

               {/* ── STAGE: PROCESSING & OUTPUT (The actual studio) ── */}
               {asset && ["smart-crop","crop","bg-removal","optimize","transform","output"].includes(stage) && (
                 <motion.div initial={{opacity:0}} animate={{opacity:1}} className="w-full h-full flex flex-col items-center justify-center max-w-5xl">
                    
                    {/* Controls Panel (Top of Canvas) */}
                    {stage !== "output" && (
                      <div className="w-full bg-white rounded-2xl border border-[rgba(15,23,42,0.08)] shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-5 mb-8 flex flex-col gap-4">
                         
                         {stage === "smart-crop" && (
                           <>
                             <div className="flex items-center justify-between">
                               <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Crop className="w-4 h-4 text-blue-500"/> Smart Crop (AI)</h3>
                               <div className="flex items-center gap-3">
                                 <code className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded">c_{transform.cropMode}, g_{transform.gravity}</code>
                                 <button onClick={() => setT("smartCropEnabled", !transform.smartCropEnabled)} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors ${transform.smartCropEnabled ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                                   {transform.smartCropEnabled ? "Disable" : "Enable"}
                                 </button>
                               </div>
                             </div>
                             {transform.smartCropEnabled && (
                               <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[rgba(15,23,42,0.08)]">
                                 <div>
                                   <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">AI Gravity</p>
                                   <div className="flex gap-2">
                                     {["auto","faces","object"].map(g => (
                                       <button key={g} onClick={() => setT("gravity", g as any)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-colors ${transform.gravity === g ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{g.toUpperCase()}</button>
                                     ))}
                                   </div>
                                 </div>
                                 <div>
                                   <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">Aspect Ratio</p>
                                   <div className="flex gap-2">
                                     {["1:1","16:9","9:16","3:4"].map(ar => (
                                       <button key={ar} onClick={() => setT("aspectRatio", ar)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-colors ${transform.aspectRatio === ar ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{ar}</button>
                                     ))}
                                   </div>
                                 </div>
                                 <div>
                                   <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">Crop Mode</p>
                                   <div className="flex gap-2">
                                     {["fill","thumb","fit"].map(m => (
                                       <button key={m} onClick={() => setT("cropMode", m as any)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-colors ${transform.cropMode === m ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{m.toUpperCase()}</button>
                                     ))}
                                   </div>
                                 </div>
                               </div>
                             )}
                           </>
                         )}

                         {stage === "bg-removal" && (
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center"><Layers className="w-4 h-4 text-violet-600" /></div>
                               <div>
                                 <h3 className="text-sm font-bold text-slate-800">Background Removal (AI)</h3>
                                 <p className="text-[10px] text-slate-500">Requires Cloudinary add-on</p>
                               </div>
                             </div>
                             <div className="flex items-center gap-3">
                               <code className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded">{transform.removeBackground ? "e_background_removal" : "off"}</code>
                               <button onClick={() => setT("removeBackground", !transform.removeBackground)} className={`text-[10px] font-bold px-4 py-2 rounded-lg transition-colors ${transform.removeBackground ? "bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-600/20" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                                 {transform.removeBackground ? "Background Removed" : "Remove Background"}
                               </button>
                             </div>
                           </div>
                         )}

                         {stage === "optimize" && (
                           <>
                             <div className="flex items-center justify-between">
                               <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-500"/> Optimization</h3>
                               <code className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded">f_{transform.format}, q_{transform.quality}</code>
                             </div>
                             <div className="grid grid-cols-2 gap-8 pt-4 border-t border-[rgba(15,23,42,0.08)]">
                               <div>
                                 <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">Format</p>
                                 <div className="flex gap-2">
                                   {["auto","webp","avif","jpg"].map(f => (
                                     <button key={f} onClick={() => setT("format", f as any)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-colors ${transform.format === f ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{f.toUpperCase()}</button>
                                   ))}
                                 </div>
                               </div>
                               <div>
                                 <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">Quality</p>
                                 <div className="flex gap-2">
                                   {["auto","60","80"].map(q => (
                                     <button key={q} onClick={() => setT("quality", q as any)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-colors ${transform.quality === q ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{q === "auto" ? "AUTO" : q}</button>
                                   ))}
                                 </div>
                               </div>
                             </div>
                           </>
                         )}

                         {stage === "transform" && (
                           <>
                             <div className="flex items-center justify-between">
                               <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Wand2 className="w-4 h-4 text-orange-500"/> Transform Studio</h3>
                             </div>
                             <div className="grid grid-cols-4 gap-4 pt-4 border-t border-[rgba(15,23,42,0.08)]">
                               <button onClick={() => setT("blur", !transform.blur)} className={`py-2 text-[10px] font-bold rounded-lg border transition-colors ${transform.blur ? "bg-orange-50 text-orange-600 border-orange-200" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Blur Effect</button>
                               <button onClick={() => setT("grayscale", !transform.grayscale)} className={`py-2 text-[10px] font-bold rounded-lg border transition-colors ${transform.grayscale ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Grayscale</button>
                               <button onClick={() => setT("flipH", !transform.flipH)} className={`py-2 text-[10px] font-bold rounded-lg border transition-colors flex items-center justify-center gap-1 ${transform.flipH ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}><FlipHorizontal className="w-3 h-3"/> Flip H</button>
                               <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2">
                                  <span className="text-[9px] font-bold text-slate-400">Rotate</span>
                                  {[0,90,180,270].map(r => (
                                     <button key={r} onClick={() => setT("rotate", r as any)} className={`flex-1 py-1 text-[9px] font-bold rounded ${transform.rotate === r ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-700"}`}>{r}°</button>
                                  ))}
                               </div>
                             </div>
                           </>
                         )}

                      </div>
                    )}

                    {/* Output Header */}
                    {stage === "output" && (
                       <div className="w-full text-center mb-8">
                          <h2 className="text-2xl font-editorial font-bold text-slate-800">Final Asset Export</h2>
                          <p className="text-sm text-slate-500 mt-2">Your asset is fully processed and optimized.</p>
                       </div>
                    )}

                    {/* Before / After Layout */}
                    <div className="w-full flex gap-8 items-center justify-center relative">
                       {/* ORIGINAL */}
                       <div className="flex-1 flex flex-col gap-3">
                          <div className="flex items-center justify-between px-2">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Original Asset</span>
                             <span className="text-[10px] font-mono text-slate-400">{fmt(asset.bytes)}</span>
                          </div>
                          <div className="bg-white p-2 rounded-2xl border border-[rgba(15,23,42,0.08)] shadow-[0_8px_30px_rgb(0,0,0,0.03)] aspect-square relative flex items-center justify-center overflow-hidden">
                             <div className="absolute inset-0 bg-slate-50/50 -z-10" />
                             <CldImage src={asset.publicId} alt="Original" fill className="object-contain p-4 drop-shadow-sm" />
                          </div>
                       </div>
                       
                       {/* DIVIDER */}
                       <div className="w-10 h-10 rounded-full bg-white border border-[rgba(15,23,42,0.08)] shadow-sm flex items-center justify-center shrink-0 z-10 text-slate-400">
                          <ArrowRight className="w-4 h-4" />
                       </div>

                       {/* RESULT */}
                       <div className="flex-1 flex flex-col gap-3">
                          <div className="flex items-center justify-between px-2">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 flex items-center gap-1.5"><Sparkles className="w-3 h-3"/> Transformed Result</span>
                             <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">f_auto, q_auto</span>
                          </div>
                          <div className="bg-white p-2 rounded-2xl border-2 border-blue-100 shadow-[0_8px_30px_rgba(59,130,246,0.08)] aspect-square relative flex items-center justify-center overflow-hidden"
                               style={transform.removeBackground ? { backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/OMEwgxgDaQaOmswI/4+wMBhgEAAA90QIDd4X3cAAAAASUVORK5CYII=')" } : undefined}
                          >
                             <div className="absolute inset-0 bg-slate-50/50 -z-10" />
                             <CldImage
                                key={JSON.stringify(transform)}
                                src={asset.publicId}
                                alt="Result"
                                fill
                                className="object-contain p-4 drop-shadow-lg"
                                crop={transform.smartCropEnabled ? transform.cropMode : undefined}
                                gravity={transform.smartCropEnabled ? transform.gravity : undefined}
                                aspectRatio={transform.smartCropEnabled && transform.aspectRatio !== "custom" ? transform.aspectRatio : undefined}
                                removeBackground={transform.removeBackground}
                                blur={transform.blur ? "800" : undefined}
                                grayscale={transform.grayscale}
                                angle={transform.rotate !== 0 ? transform.rotate : undefined}
                                format={transform.format !== "auto" ? (transform.format as "jpg"|"png"|"webp"|"avif") : undefined}
                                quality={transform.quality !== "auto" ? parseInt(transform.quality) : "auto"}
                                rawTransformations={[
                                  ...(transform.flipH ? ["a_hflip"] : []),
                                  ...(transform.flipV ? ["a_vflip"] : []),
                                ].join("/") || undefined}
                             />
                          </div>
                       </div>
                    </div>

                    {/* Output Actions */}
                    {stage === "output" && (
                       <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="mt-12 flex flex-col gap-4 w-full max-w-md">
                          <button onClick={handleSave} disabled={saveLoading || saved} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50">
                             {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                             {saveLoading ? "Saving..." : saved ? "Saved to Library" : "Save to Media Library"}
                          </button>
                          <div className="flex gap-2">
                             <button onClick={copyUrl} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                               {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />} {copiedUrl ? "Copied" : "Copy Delivery URL"}
                             </button>
                             <a href={deliveryUrl} target="_blank" rel="noreferrer" className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                               <ExternalLink className="w-3.5 h-3.5" /> Open Direct
                             </a>
                          </div>
                       </motion.div>
                    )}

                 </motion.div>
               )}
           </div>

           {/* ── BOTTOM: Processing Dock ── */}
           <AnimatePresence>
             {asset && stage !== "upload" && stage !== "output" && (
                <motion.div initial={{y:100}} animate={{y:0}} exit={{y:100}} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-[rgba(15,23,42,0.08)] shadow-[0_20px_40px_rgb(0,0,0,0.08)] rounded-2xl flex items-center justify-center p-2 gap-1 z-20">
                   <DockItem icon={<Crop className="w-4 h-4" />} label="Smart Crop" active={stage === "smart-crop"} onClick={() => setStage("smart-crop")} />
                   <DockItem icon={<Layers className="w-4 h-4" />} label="Remove BG" active={stage === "bg-removal"} onClick={() => setStage("bg-removal")} />
                   <DockItem icon={<Zap className="w-4 h-4" />} label="Optimize" active={stage === "optimize"} onClick={() => setStage("optimize")} />
                   <DockItem icon={<Wand2 className="w-4 h-4" />} label="Transform" active={stage === "transform"} onClick={() => setStage("transform")} />
                   <div className="w-px h-6 bg-slate-200 mx-2"></div>
                   <DockItem icon={<Save className="w-4 h-4" />} label="Export" active={false} onClick={() => setStage("output")} />
                </motion.div>
             )}
           </AnimatePresence>
        </main>

        {/* ── RIGHT: Intelligence Panel ── */}
        <aside className="w-72 bg-white border-l border-[rgba(15,23,42,0.08)] flex flex-col overflow-y-auto z-10 shrink-0 shadow-[-4px_0_24px_rgb(0,0,0,0.02)]">
           {!asset ? (
             <div className="p-6">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6">Workspace Intel</p>
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mb-8">
                   <h3 className="text-sm font-bold text-slate-800 mb-2">Ready for media</h3>
                   <p className="text-[11px] text-slate-500 leading-relaxed">Upload an image or video to begin the AI analysis and transformation workflow.</p>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Supported Formats</p>
                <div className="space-y-4">
                   <div>
                      <p className="text-xs font-bold text-slate-700 mb-1">Images</p>
                      <p className="text-[10px] text-slate-500">JPEG, PNG, WEBP, GIF, AVIF</p>
                   </div>
                   <div>
                      <p className="text-xs font-bold text-slate-700 mb-1">Video</p>
                      <p className="text-[10px] text-slate-500">MP4, WEBM, MOV</p>
                   </div>
                </div>
             </div>
           ) : (
             <div className="p-6 flex flex-col gap-8">
                
                {/* File Details Bento */}
                <div>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Asset Identity</p>
                   <div className="bg-white rounded-xl p-3 border border-[rgba(15,23,42,0.08)] shadow-sm flex gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 relative shrink-0">
                        <CldImage src={asset.publicId} fill alt="thumb" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex flex-col justify-center">
                        <p className="text-xs font-bold text-slate-800 truncate">{asset.publicId}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">{asset.width}×{asset.height} · {asset.format.toUpperCase()}</p>
                      </div>
                   </div>
                </div>

                {intelLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                     <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Extracting Intelligence</p>
                  </div>
                ) : intel ? (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-8">
                     
                     {/* Moderation Bento */}
                     <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Moderation</p>
                        <div className={`flex items-center justify-between p-3 rounded-xl border font-bold text-xs ${
                            intel.moderation === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            intel.moderation === "rejected" ? "bg-red-50 text-red-700 border-red-100" :
                            "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                           <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> STATUS</div>
                           <div>{intel.moderation === "approved" ? "SAFE" : intel.moderation === "rejected" ? "FLAGGED" : "PENDING"}</div>
                        </div>
                     </div>

                     {/* Tags Bento */}
                     {intel.tags.length > 0 && (
                       <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">AI Tags</p>
                          <div className="bg-white rounded-xl p-4 border border-[rgba(15,23,42,0.08)] shadow-sm space-y-3">
                             {intel.tags.slice(0,8).map(t => (
                               <div key={t.tag} className="flex items-center justify-between group">
                                  <span className="text-xs font-medium text-slate-700 capitalize flex items-center gap-2"><Tag className="w-3 h-3 text-slate-400" /> {t.tag}</span>
                                  <span className="text-[10px] font-mono text-slate-400">{t.confidence}%</span>
                               </div>
                             ))}
                          </div>
                       </div>
                     )}

                     {/* Caption Bento */}
                     {intel.caption && (
                       <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">AI Caption</p>
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                             <p className="text-xs text-slate-600 leading-relaxed italic">&ldquo;{intel.caption}&rdquo;</p>
                          </div>
                       </div>
                     )}

                  </motion.div>
                ) : null}
             </div>
           )}
        </aside>
      </div>
    </div>
  );
}
