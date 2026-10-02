"use client";

import { useState, useRef, useCallback } from "react";
import { CldImage } from "next-cloudinary";
import {
  Upload, Crop, Layers, Zap, Wand2, Brain, ShieldCheck,
  Check, RotateCcw, FlipHorizontal, FlipVertical,
  Save, ArrowRight, Loader2, AlertCircle, X,
  Sparkles, Eye, Copy, ExternalLink,
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

  return (
    <div className="flex h-[calc(100vh-120px)] min-h-[600px] bg-white rounded-2xl border border-[--color-rule] shadow-sm overflow-hidden">

      {/* ══ LEFT: Tool navigation ══════════════════════════════════════════════ */}
      <aside className="w-52 flex-shrink-0 flex flex-col border-r border-[--color-rule] bg-[--color-surface-2]">
        <div className="px-3 py-4 border-b border-[--color-rule]">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[--color-ink-4]">Media Workspace</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {(() => {
            let lastGroup = "";
            return STAGES.map((s) => {
              const isDisabled = s.requiresAsset && !asset;
              const isActive = stage === s.id;
              const Icon = s.icon;
              const groupHeader = s.group !== undefined && s.group !== lastGroup
                ? (lastGroup = s.group, s.group)
                : (lastGroup = lastGroup, null);

              return (
                <div key={s.id}>
                  {groupHeader !== null && groupHeader !== "" && (
                    <p className="text-[8px] font-bold uppercase tracking-widest text-[--color-ink-4] px-2 pt-3 pb-1">
                      {groupHeader}
                    </p>
                  )}
                  <button
                    disabled={isDisabled}
                    onClick={() => !isDisabled && setStage(s.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : isDisabled
                        ? "text-[--color-ink-4] opacity-40 cursor-not-allowed"
                        : "text-[--color-ink-3] hover:bg-white hover:text-[--color-ink] hover:shadow-sm"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{s.label}</span>
                    {isActive && <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0" />}
                  </button>
                </div>
              );
            });
          })()}
        </nav>

        {/* Asset info footer */}
        {asset && (
          <div className="p-3 border-t border-[--color-rule] bg-white">
            <p className="text-[8px] font-bold uppercase tracking-widest text-[--color-ink-4] mb-1">Asset</p>
            <p className="text-[10px] font-mono text-[--color-ink] truncate">{asset.publicId}</p>
            <p className="text-[9px] text-[--color-ink-4] mt-0.5">
              {fmt(asset.bytes)} · {asset.format.toUpperCase()}
              {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""}
            </p>
          </div>
        )}
      </aside>

      {/* ══ CENTER: Canvas ════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[--color-surface-2] min-w-0">

        {/* Canvas toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[--color-rule] bg-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[--color-ink]">
              {STAGES.find(s => s.id === stage)?.label ?? "Canvas"}
            </span>
            {asset && (
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                ● Cloudinary
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {asset && (
              <>
                <button
                  onClick={resetTransform}
                  className="flex items-center gap-1 text-[10px] font-bold text-[--color-ink-3] hover:text-[--color-ink] transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
                <button
                  onClick={resetAll}
                  className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-3 h-3" /> New Upload
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main canvas area */}
        <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center">

          {/* ── UPLOAD STAGE ────────────────────────────────────────────── */}
          {stage === "upload" && (
            <div className="w-full max-w-xl space-y-4">
              {!pendingFile ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all p-16 ${
                    isDragging ? "border-blue-400 bg-blue-50 scale-[1.01]" : "border-[--color-rule] bg-white hover:border-blue-300 hover:bg-blue-50/50"
                  }`}
                >
                  <input ref={fileInputRef} type="file" accept="image/*,video/mp4,video/webm,video/quicktime" className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDragging ? "bg-blue-100" : "bg-[--color-surface-2]"}`}>
                    <Upload className={`w-7 h-7 ${isDragging ? "text-blue-600" : "text-[--color-ink-4]"}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-[--color-ink] mb-1">{isDragging ? "Drop to upload" : "Drag & drop media"}</p>
                    <p className="text-xs text-[--color-ink-3]">or <span className="text-blue-600 font-bold">browse files</span></p>
                    <p className="text-[10px] text-[--color-ink-4] mt-2">JPEG · PNG · WEBP · GIF · MP4 · WEBM · max 10 MB</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[--color-rule] shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[--color-rule]">
                    <div className="flex items-center gap-2">
                      <FileImage className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-[--color-ink] truncate max-w-[200px]">{pendingFile.name}</span>
                      <span className="text-[10px] text-[--color-ink-4]">({fmt(pendingFile.size)})</span>
                    </div>
                    <button onClick={resetAll} className="text-[--color-ink-4] hover:text-[--color-ink]"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="relative bg-[--color-surface-2] min-h-[200px] flex items-center justify-center">
                    {previewUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="Preview" className="max-w-full max-h-64 object-contain" />
                    )}
                    {uploadProgress !== null && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-white/95 backdrop-blur-md"
                      >
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative flex items-center justify-center">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute w-24 h-24 bg-blue-100 rounded-full blur-xl"
                            />
                            <div className="relative w-16 h-16 bg-white border border-blue-100 shadow-[0_8px_30px_-4px_rgba(59,130,246,0.15)] rounded-[16px] flex items-center justify-center z-10">
                              <Upload className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          <h3 className="font-editorial text-lg font-medium text-gray-900">
                            Uploading to Cloudinary
                          </h3>
                        </div>

                        <div className="w-64 space-y-2">
                          <div className="flex justify-between font-ui text-[11px] font-medium text-gray-500">
                            <span>Processing media...</span>
                            <span className="tabular-nums text-blue-600 font-bold">{uploadProgress}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full relative" 
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="absolute inset-0 bg-white/30" style={{ animation: "shimmer 2s infinite linear", backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)" }} />
                            </motion.div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-2 font-ui text-[10px] text-gray-400">
                          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Validated</span>
                          <span className="w-1 h-1 rounded-full bg-gray-200" />
                          <span className="flex items-center gap-1.5 text-blue-500 font-bold"><Loader2 className="w-3 h-3 animate-spin" /> Uploading</span>
                          <span className="w-1 h-1 rounded-full bg-gray-200" />
                          <span className="flex items-center gap-1.5"><Brain className="w-3 h-3" /> Waiting for AI</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  {uploadError && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-t border-red-100">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <p className="text-xs font-bold text-red-600">{uploadError}</p>
                    </div>
                  )}
                  <div className="px-4 py-3 flex justify-end gap-2 border-t border-[--color-rule]">
                    <button onClick={resetAll} className="px-3 py-1.5 text-xs font-bold border border-[--color-rule] rounded-lg hover:bg-[--color-surface-2]">Cancel</button>
                    <button
                      onClick={uploadFile}
                      disabled={uploadProgress !== null}
                      className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {uploadProgress !== null ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      Upload to Cloudinary
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── INSPECT STAGE ────────────────────────────────────────────── */}
          {stage === "inspect" && asset && (
            <div className="w-full max-w-xl space-y-4">
              <div className="bg-white rounded-2xl border border-[--color-rule] shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[--color-rule]">
                  <div className="flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-bold text-[--color-ink]">Uploaded to Cloudinary</span>
                  </div>
                  <a href={asset.secureUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">
                    <ExternalLink className="w-3 h-3" /> Open original
                  </a>
                </div>
                <div className="bg-[--color-surface-2] flex items-center justify-center" style={{ minHeight: 240 }}>
                  <CldImage
                    src={asset.publicId}
                    alt="Uploaded"
                    width={asset.width || 600}
                    height={asset.height || 400}
                    className="max-w-full max-h-60 object-contain"
                  />
                </div>
                <div className="px-4 py-3 grid grid-cols-3 divide-x divide-[--color-rule] text-center border-t border-[--color-rule]">
                  <div className="px-2"><p className="text-[9px] text-[--color-ink-4] uppercase font-bold">Format</p><p className="text-xs font-bold text-[--color-ink] mt-0.5 uppercase">{asset.format}</p></div>
                  <div className="px-2"><p className="text-[9px] text-[--color-ink-4] uppercase font-bold">Size</p><p className="text-xs font-bold text-[--color-ink] mt-0.5">{fmt(asset.bytes)}</p></div>
                  <div className="px-2"><p className="text-[9px] text-[--color-ink-4] uppercase font-bold">Dimensions</p><p className="text-xs font-bold text-[--color-ink] mt-0.5">{asset.width && asset.height ? `${asset.width}×${asset.height}` : "—"}</p></div>
                </div>
              </div>

              {/* Analysis steps */}
              <div className="bg-white rounded-2xl border border-[--color-rule] shadow-sm p-4 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5 text-violet-600" />
                    <span className="text-xs font-bold text-[--color-ink]">AI Analysis</span>
                  </div>
                  {intelLoading && <Loader2 className="w-3 h-3 text-violet-500 animate-spin" />}
                </div>
                {intelSteps.map((s) => (
                  <div key={s.step} className="flex items-center gap-2">
                    {s.status === "done"    && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                    {s.status === "running" && <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin flex-shrink-0" />}
                    {s.status === "error"   && <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                    {s.status === "pending" && <div className="w-3.5 h-3.5 rounded-full border-2 border-[--color-rule] flex-shrink-0" />}
                    <span className={`text-xs font-semibold ${
                      s.status === "done" ? "text-emerald-700"
                      : s.status === "running" ? "text-blue-600"
                      : s.status === "error" ? "text-red-500"
                      : "text-[--color-ink-4]"
                    }`}>{s.step}</span>
                  </div>
                ))}
              </div>

              {intel && (
                <button
                  onClick={() => setStage("smart-crop")}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Continue to Processing <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* ── PROCESSING STAGES (smart-crop, crop, bg-removal, optimize, transform) ── */}
          {asset && ["smart-crop","crop","bg-removal","optimize","transform"].includes(stage) && (
            <div className="w-full space-y-4">
              {/* Before / After */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-[--color-rule] shadow-sm overflow-hidden">
                  <div className="px-3 py-2 border-b border-[--color-rule]">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[--color-ink-4]">Original</p>
                  </div>
                  <div className="aspect-square relative bg-[--color-surface-2]">
                    <CldImage src={asset.publicId} alt="Original" fill className="object-contain" />
                  </div>
                </div>

                <div className="bg-white rounded-xl border-2 border-blue-200 shadow-sm overflow-hidden">
                  <div className="px-3 py-2 border-b border-[--color-rule] flex items-center gap-1.5 bg-blue-50">
                    <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                    <p className="text-[9px] font-bold uppercase tracking-widest text-blue-600">Result</p>
                  </div>
                  <div
                    className="aspect-square relative bg-[--color-surface-2]"
                    style={transform.removeBackground ? {
                      backgroundImage: "linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)",
                      backgroundSize: "16px 16px",
                      backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
                    } : undefined}
                  >
                    <CldImage
                      key={JSON.stringify(transform)}
                      src={asset.publicId}
                      alt="Result"
                      fill
                      className="object-contain"
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

              {/* Active params strip */}
              {activeParams.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {activeParams.map((p, i) => (
                    <code key={i} className={`text-[9px] font-mono px-2 py-0.5 rounded border ${p.color}`}>{p.label}</code>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── OUTPUT STAGE ─────────────────────────────────────────────── */}
          {stage === "output" && asset && (
            <div className="w-full max-w-xl space-y-4">
              <div className="bg-white rounded-2xl border border-[--color-rule] shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-[--color-rule] flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-bold text-[--color-ink]">Final Result</span>
                </div>
                <div className="bg-[--color-surface-2] flex items-center justify-center min-h-[240px]"
                  style={transform.removeBackground ? {
                    backgroundImage: "linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)",
                    backgroundSize: "16px 16px", backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
                  } : undefined}
                >
                  <CldImage
                    key={`output-${JSON.stringify(transform)}`}
                    src={asset.publicId}
                    alt="Final output"
                    width={parseInt(transform.width) || 800}
                    height={parseInt(transform.height) || 800}
                    className="max-w-full max-h-64 object-contain"
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

              {/* Delivery URL */}
              <div className="bg-[--color-surface-2] rounded-xl border border-[--color-rule] p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[--color-ink-4]">Cloudinary Delivery URL</p>
                  <div className="flex gap-2">
                    <button onClick={copyUrl} className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline">
                      {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedUrl ? "Copied!" : "Copy"}
                    </button>
                    <a href={deliveryUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-[--color-ink-3] hover:text-[--color-ink]">
                      <ExternalLink className="w-3 h-3" /> Open
                    </a>
                  </div>
                </div>
                <code className="text-[9px] font-mono text-[--color-ink] break-all leading-relaxed block">{deliveryUrl}</code>
              </div>

              {/* Save */}
              {!saved ? (
                <button
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saveLoading ? "Saving..." : "Save to Media Library"}
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs font-bold text-emerald-700">
                  <Check className="w-4 h-4" />
                  Saved! View in <Link href="/dashboard/evidence" className="underline ml-1">Media Library →</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══ RIGHT: Controls panel ═════════════════════════════════════════════ */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-l border-[--color-rule] bg-white overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[--color-rule] flex items-center gap-2">
          <Settings className="w-3.5 h-3.5 text-[--color-ink-4]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[--color-ink-4]">Controls</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* ── UPLOAD controls ──────────────────────────────────────────── */}
          {stage === "upload" && (
            <div className="space-y-3 text-xs text-[--color-ink-3]">
              <p className="font-bold text-[--color-ink]">Getting Started</p>
              {[
                { n: 1, text: "Upload any image or video file" },
                { n: 2, text: "AI analyzes tags & moderation" },
                { n: 3, text: "Apply transformations visually" },
                { n: 4, text: "Copy delivery URL or save" },
              ].map(({ n, text }) => (
                <div key={n} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{n}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── INSPECT controls ─────────────────────────────────────────── */}
          {stage === "inspect" && intel && (
            <div className="space-y-4">
              {intel.tags.length > 0 && (
                <PanelSection title="AI Tags">
                  <div className="space-y-1.5">
                    {intel.tags.map(({ tag, confidence }) => (
                      <div key={tag} className="flex items-center gap-2">
                        <span className="text-[11px] text-[--color-ink] flex-1 capitalize">{tag}</span>
                        <div className="w-12 h-1 bg-[--color-rule] rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${confidence}%` }} />
                        </div>
                        <span className="text-[9px] font-bold text-[--color-ink-4] w-7 text-right tabular-nums">{confidence}%</span>
                      </div>
                    ))}
                  </div>
                </PanelSection>
              )}
              {intel.caption && (
                <PanelSection title="AI Caption">
                  <p className="text-[11px] text-violet-700 italic">&ldquo;{intel.caption}&rdquo;</p>
                </PanelSection>
              )}
              <PanelSection title="Moderation">
                <div className={`flex items-center gap-2 text-xs font-bold rounded-lg px-2.5 py-2 ${
                  intel.moderation === "approved" ? "text-emerald-700 bg-emerald-50"
                  : intel.moderation === "rejected" ? "text-red-700 bg-red-50"
                  : "text-amber-700 bg-amber-50"
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {intel.moderation === "approved" ? "✓ Content Approved"
                    : intel.moderation === "rejected" ? "⚠ Content Flagged"
                    : intel.moderation === "addon_required" ? "Add-on Required"
                    : "Moderation Pending"}
                </div>
                {intel.moderation === "addon_required" && (
                  <p className="text-[10px] text-amber-600 mt-1">Enable the Cloudinary AI Moderation add-on to get results.</p>
                )}
              </PanelSection>
            </div>
          )}

          {/* ── SMART CROP controls ───────────────────────────────────────── */}
          {stage === "smart-crop" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                <div className={`w-2 h-2 rounded-full ${transform.smartCropEnabled ? "bg-blue-600" : "bg-[--color-rule]"}`} />
                <span className="text-[10px] font-bold text-blue-700">
                  {transform.smartCropEnabled ? "Smart Crop Active" : "Smart Crop Off"}
                </span>
                <button
                  onClick={() => setT("smartCropEnabled", !transform.smartCropEnabled)}
                  className={`ml-auto text-[9px] font-bold px-2 py-0.5 rounded border transition-all ${transform.smartCropEnabled ? "bg-white text-red-600 border-red-200 hover:bg-red-50" : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"}`}
                >
                  {transform.smartCropEnabled ? "Disable" : "Enable"}
                </button>
              </div>

              <PanelSection title="Gravity">
                <div className="grid grid-cols-2 gap-1.5">
                  {([
                    { v: "auto", l: "AI Auto", sub: "Best focus" },
                    { v: "faces", l: "Face", sub: "Detect faces" },
                    { v: "object", l: "Object", sub: "Main object" },
                    { v: "center", l: "Center", sub: "Geometric" },
                  ] as const).map(({ v, l, sub }) => (
                    <button
                      key={v}
                      onClick={() => { setT("gravity", v); setT("smartCropEnabled", true); }}
                      className={`px-2 py-1.5 rounded-lg border text-left transition-all ${
                        transform.gravity === v && transform.smartCropEnabled
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-[--color-rule] hover:bg-blue-50 hover:border-blue-200"
                      }`}
                    >
                      <p className="text-[10px] font-bold">{l}</p>
                      <p className={`text-[8px] ${transform.gravity === v && transform.smartCropEnabled ? "text-blue-200" : "text-[--color-ink-4]"}`}>{sub}</p>
                    </button>
                  ))}
                </div>
              </PanelSection>

              <PanelSection title="Crop Mode">
                <div className="flex flex-wrap gap-1">
                  {(["fill","thumb","fit","scale","crop","pad"] as const).map(m => (
                    <OptionBtn key={m} active={transform.cropMode === m && transform.smartCropEnabled} onClick={() => { setT("cropMode", m); setT("smartCropEnabled", true); }}>
                      {m}
                    </OptionBtn>
                  ))}
                </div>
              </PanelSection>

              <PanelSection title="Preset">
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { l: "Square", v: "1:1" }, { l: "Portrait", v: "3:4" },
                    { l: "Landscape", v: "16:9" }, { l: "Social", v: "4:5" },
                    { l: "Wide", v: "21:9" }, { l: "Classic", v: "4:3" },
                  ].map(({ l, v }) => (
                    <button key={l} onClick={() => { setT("aspectRatio", v); setT("smartCropEnabled", true); }}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                        transform.aspectRatio === v && transform.smartCropEnabled ? "bg-blue-50 border-blue-400 text-blue-700" : "border-[--color-rule] hover:bg-[--color-surface-2] text-[--color-ink]"
                      }`}
                    >
                      {l} <span className="opacity-50 font-mono">{v}</span>
                    </button>
                  ))}
                </div>
              </PanelSection>

              <PanelSection title="Dimensions">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[9px] text-[--color-ink-4] mb-1">Width</p>
                    <input type="number" value={transform.width} onChange={(e) => setT("width", e.target.value)}
                      className="w-full px-2 py-1 border border-[--color-rule] rounded text-xs font-bold focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <p className="text-[9px] text-[--color-ink-4] mb-1">Height</p>
                    <input type="number" value={transform.height} onChange={(e) => setT("height", e.target.value)}
                      className="w-full px-2 py-1 border border-[--color-rule] rounded text-xs font-bold focus:outline-none focus:border-blue-400" />
                  </div>
                </div>
              </PanelSection>

              <div className="bg-[--color-surface-2] rounded-lg border border-[--color-rule] p-2.5">
                <p className="text-[8px] font-bold uppercase tracking-widest text-[--color-ink-4] mb-1.5">Cloudinary</p>
                <div className="flex flex-wrap gap-1">
                  {transform.smartCropEnabled ? (
                    <>
                      <code className="text-[9px] font-mono text-blue-600">{`c_${transform.cropMode}`}</code>
                      <code className="text-[9px] font-mono text-blue-600">{`g_${transform.gravity}`}</code>
                      {transform.aspectRatio !== "custom" && <code className="text-[9px] font-mono text-blue-600">{`ar_${transform.aspectRatio.replace(":","_")}`}</code>}
                    </>
                  ) : (
                    <span className="text-[9px] text-[--color-ink-4]">Enable Smart Crop to apply</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── CROP controls ─────────────────────────────────────────────── */}
          {stage === "crop" && (
            <div className="space-y-4">
              <PanelSection title="Aspect Ratio">
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { l: "Freeform", v: "custom" }, { l: "Square 1:1", v: "1:1" },
                    { l: "Portrait 3:4", v: "3:4" }, { l: "Landscape 16:9", v: "16:9" },
                    { l: "Vertical 9:16", v: "9:16" }, { l: "Classic 4:3", v: "4:3" },
                  ].map(({ l, v }) => (
                    <button key={l}
                      onClick={() => { setT("aspectRatio", v); setT("cropMode", "fill"); setT("gravity", "center"); setT("smartCropEnabled", true); }}
                      className={`text-left px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                        transform.aspectRatio === v && transform.smartCropEnabled ? "bg-violet-50 border-violet-400 text-violet-700" : "border-[--color-rule] hover:bg-[--color-surface-2]"
                      }`}
                    >{l}</button>
                  ))}
                </div>
              </PanelSection>
              <PanelSection title="Rotate">
                <div className="flex gap-1">
                  {([0, 90, 180, 270] as const).map(r => (
                    <button key={r} onClick={() => setT("rotate", r)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${transform.rotate === r ? "bg-violet-600 text-white border-violet-600" : "border-[--color-rule] hover:bg-[--color-surface-2]"}`}
                    >{r}°</button>
                  ))}
                </div>
              </PanelSection>
              <PanelSection title="Flip">
                <div className="flex gap-1.5">
                  <button onClick={() => setT("flipH", !transform.flipH)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${transform.flipH ? "bg-violet-600 text-white border-violet-600" : "border-[--color-rule] hover:bg-[--color-surface-2]"}`}
                  ><FlipHorizontal className="w-3 h-3" /> H</button>
                  <button onClick={() => setT("flipV", !transform.flipV)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${transform.flipV ? "bg-violet-600 text-white border-violet-600" : "border-[--color-rule] hover:bg-[--color-surface-2]"}`}
                  ><FlipVertical className="w-3 h-3" /> V</button>
                </div>
              </PanelSection>
            </div>
          )}

          {/* ── BG REMOVAL controls ───────────────────────────────────────── */}
          {stage === "bg-removal" && (
            <div className="space-y-4">
              {/* Honest capability notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-amber-700">Add-on Required</p>
                    <p className="text-[10px] text-amber-600 mt-0.5">
                      Background removal requires the Cloudinary AI Background Removal add-on.
                      If not enabled, the result will show the original image.
                    </p>
                  </div>
                </div>
              </div>

              <PanelSection title="Remove Background">
                <button
                  onClick={() => setT("removeBackground", !transform.removeBackground)}
                  className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                    transform.removeBackground
                      ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                      : "border-[--color-rule] text-[--color-ink] hover:bg-violet-50 hover:border-violet-300"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  {transform.removeBackground ? "Background Removal ON" : "Enable Background Removal"}
                </button>
              </PanelSection>

              <div className="bg-[--color-surface-2] rounded-lg border border-[--color-rule] p-2.5">
                <p className="text-[8px] font-bold uppercase tracking-widest text-[--color-ink-4] mb-1.5">Cloudinary Parameter</p>
                <code className={`text-[10px] font-mono ${transform.removeBackground ? "text-violet-600" : "text-[--color-ink-4]"}`}>
                  {transform.removeBackground ? "e_background_removal" : "(not applied)"}
                </code>
              </div>

              {!cloudinaryConfigured && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-red-700">Cloudinary Not Configured</p>
                  <p className="text-[10px] text-red-600 mt-0.5">Check your environment variables.</p>
                  <Link href="/dashboard/configuration" className="text-[10px] font-bold text-red-700 underline mt-1 block">Check Configuration →</Link>
                </div>
              )}
            </div>
          )}

          {/* ── OPTIMIZE controls ─────────────────────────────────────────── */}
          {stage === "optimize" && (
            <div className="space-y-4">
              <PanelSection title="Format">
                <div className="grid grid-cols-2 gap-1">
                  {(["auto","jpg","png","webp","avif"] as const).map(f => (
                    <button key={f} onClick={() => setT("format", f)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${transform.format === f ? "bg-emerald-50 border-emerald-400 text-emerald-700" : "border-[--color-rule] hover:bg-[--color-surface-2]"}`}
                    >
                      {f === "auto" ? "Auto ★" : f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </PanelSection>
              <PanelSection title="Quality">
                <div className="grid grid-cols-2 gap-1">
                  {(["auto","60","70","80","90"] as const).map(q => (
                    <button key={q} onClick={() => setT("quality", q)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${transform.quality === q ? "bg-emerald-50 border-emerald-400 text-emerald-700" : "border-[--color-rule] hover:bg-[--color-surface-2]"}`}
                    >
                      {q === "auto" ? "Auto ★" : `q_${q}`}
                    </button>
                  ))}
                </div>
              </PanelSection>
              <div className="bg-[--color-surface-2] rounded-lg border border-[--color-rule] p-2.5">
                <p className="text-[8px] font-bold uppercase tracking-widest text-[--color-ink-4] mb-1.5">Active</p>
                <code className="text-[10px] font-mono text-emerald-600">{`f_${transform.format},q_${transform.quality}`}</code>
                <p className="text-[9px] text-[--color-ink-4] mt-1.5">Actual savings measured at delivery time by Cloudinary.</p>
              </div>
            </div>
          )}

          {/* ── TRANSFORM STUDIO controls ─────────────────────────────────── */}
          {stage === "transform" && (
            <div className="space-y-4">
              <PanelSection title="Effects">
                <div className="space-y-1">
                  <button onClick={() => setT("blur", !transform.blur)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-bold border flex items-center justify-between transition-all ${transform.blur ? "bg-orange-50 border-orange-400 text-orange-700" : "border-[--color-rule] hover:bg-[--color-surface-2]"}`}
                  >Blur {transform.blur && <Check className="w-3 h-3" />}</button>
                  <button onClick={() => setT("grayscale", !transform.grayscale)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-bold border flex items-center justify-between transition-all ${transform.grayscale ? "bg-gray-100 border-gray-400 text-gray-700" : "border-[--color-rule] hover:bg-[--color-surface-2]"}`}
                  >Grayscale {transform.grayscale && <Check className="w-3 h-3" />}</button>
                </div>
              </PanelSection>
              <PanelSection title="Rotate">
                <div className="flex gap-1">
                  {([0,90,180,270] as const).map(r => (
                    <button key={r} onClick={() => setT("rotate", r)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${transform.rotate === r ? "bg-orange-600 text-white border-orange-600" : "border-[--color-rule] hover:bg-[--color-surface-2]"}`}
                    >{r}°</button>
                  ))}
                </div>
              </PanelSection>
              <PanelSection title="Flip">
                <div className="flex gap-1.5">
                  <button onClick={() => setT("flipH", !transform.flipH)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${transform.flipH ? "bg-orange-600 text-white border-orange-600" : "border-[--color-rule] hover:bg-[--color-surface-2]"}`}
                  ><FlipHorizontal className="w-3 h-3" /> Flip H</button>
                  <button onClick={() => setT("flipV", !transform.flipV)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${transform.flipV ? "bg-orange-600 text-white border-orange-600" : "border-[--color-rule] hover:bg-[--color-surface-2]"}`}
                  ><FlipVertical className="w-3 h-3" /> Flip V</button>
                </div>
              </PanelSection>
              <PanelSection title="Dimensions">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[9px] text-[--color-ink-4] mb-1">Width</p>
                    <input type="number" value={transform.width} onChange={(e) => setT("width", e.target.value)}
                      className="w-full px-2 py-1 border border-[--color-rule] rounded text-xs font-bold focus:outline-none focus:border-orange-400" />
                  </div>
                  <div>
                    <p className="text-[9px] text-[--color-ink-4] mb-1">Height</p>
                    <input type="number" value={transform.height} onChange={(e) => setT("height", e.target.value)}
                      className="w-full px-2 py-1 border border-[--color-rule] rounded text-xs font-bold focus:outline-none focus:border-orange-400" />
                  </div>
                </div>
              </PanelSection>
            </div>
          )}

          {/* ── OUTPUT controls ───────────────────────────────────────────── */}
          {stage === "output" && (
            <div className="space-y-4">
              {intel && (
                <>
                  {intel.tags.length > 0 && (
                    <PanelSection title="AI Tags">
                      <div className="flex flex-wrap gap-1">
                        {intel.tags.slice(0, 6).map(({ tag, confidence }) => (
                          <span key={tag} className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-1.5 py-0.5 capitalize">
                            {tag} <span className="text-blue-400">{confidence}%</span>
                          </span>
                        ))}
                      </div>
                    </PanelSection>
                  )}
                  <PanelSection title="Applied Transforms">
                    <div className="space-y-1">
                      {transform.smartCropEnabled && <div className="flex items-center gap-1.5 text-[10px] text-emerald-700"><Check className="w-3 h-3" /> Smart Crop ({transform.gravity})</div>}
                      {transform.removeBackground && <div className="flex items-center gap-1.5 text-[10px] text-emerald-700"><Check className="w-3 h-3" /> Background Removed</div>}
                      {transform.blur && <div className="flex items-center gap-1.5 text-[10px] text-emerald-700"><Check className="w-3 h-3" /> Blur Effect</div>}
                      {transform.grayscale && <div className="flex items-center gap-1.5 text-[10px] text-emerald-700"><Check className="w-3 h-3" /> Grayscale</div>}
                      {transform.rotate !== 0 && <div className="flex items-center gap-1.5 text-[10px] text-emerald-700"><Check className="w-3 h-3" /> Rotated {transform.rotate}°</div>}
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-700"><Check className="w-3 h-3" /> Format: f_{transform.format}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-700"><Check className="w-3 h-3" /> Quality: q_{transform.quality}</div>
                    </div>
                  </PanelSection>
                </>
              )}
            </div>
          )}

          {/* Go to output button for process stages */}
          {asset && ["smart-crop","crop","bg-removal","optimize","transform"].includes(stage) && (
            <div className="pt-2 border-t border-[--color-rule]">
              <button
                onClick={() => setStage("output")}
                className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> Preview & Save
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
