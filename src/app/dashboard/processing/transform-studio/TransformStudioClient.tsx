"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";
import Link from "next/link";
import { Wand2, Check, ChevronDown, Copy, RotateCcw } from "lucide-react";

const FALLBACK_ASSET = "samples/people/kitchen-bar";

const EFFECTS = [
  { value: "none",      label: "None" },
  { value: "blur",      label: "Blur" },
  { value: "grayscale", label: "Grayscale" },
] as const;

type Effect = typeof EFFECTS[number]["value"];

interface TransformStudioClientProps {
  defaultAssetId: string;
  recentMedia: { id: string; evidence_asset_id: string }[];
}

export function TransformStudioClient({ defaultAssetId, recentMedia }: TransformStudioClientProps) {
  const assetId = defaultAssetId || FALLBACK_ASSET;
  const [selectedAsset, setSelectedAsset] = useState(assetId);
  const [showPicker, setShowPicker] = useState(false);

  // Controls
  const [width, setWidth] = useState<string>("800");
  const [height, setHeight] = useState<string>("600");
  const [lockAspect, setLockAspect] = useState(false);
  const [cropMode, setCropMode] = useState("fill");
  const [gravity, setGravity] = useState("auto");
  const [format, setFormat] = useState("auto");
  const [quality, setQuality] = useState("auto");
  const [effect, setEffect] = useState<Effect>("none");

  const reset = () => {
    setWidth("800"); setHeight("600"); setLockAspect(false);
    setCropMode("fill"); setGravity("auto");
    setFormat("auto"); setQuality("auto"); setEffect("none");
  };

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "demo";
  const transformParts: string[] = [];
  if (width || height) transformParts.push(`c_${cropMode},w_${width || "auto"},h_${height || "auto"},g_${gravity}`);
  if (format !== "auto") transformParts.push(`f_${format}`);
  if (quality !== "auto") transformParts.push(`q_${quality}`);
  if (effect === "blur") transformParts.push("e_blur:800");
  if (effect === "grayscale") transformParts.push("e_grayscale");
  const transformStr = transformParts.join("/");
  const deliveryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}/${selectedAsset}`;

  const hasNoMedia = recentMedia.length === 0 && defaultAssetId === FALLBACK_ASSET;

  return (
    <div className="space-y-6">
      {/* Asset selector */}
      <div className="bg-white rounded-2xl border border-[--color-rule] shadow-sm p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-[--color-rule] overflow-hidden relative bg-[--color-surface-2] flex-shrink-0">
              <CldImage src={selectedAsset} alt="Selected" fill className="object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold text-[--color-ink]">Current Asset</p>
              <p className="text-[10px] font-mono text-[--color-ink-4] truncate max-w-[220px]">{selectedAsset}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-[--color-rule] rounded-lg bg-white hover:bg-[--color-surface-2] transition-colors text-[--color-ink-3]">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
            <div className="relative">
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-[--color-rule] rounded-lg bg-white hover:bg-[--color-surface-2] transition-colors"
              >
                Change Media <ChevronDown className="w-3 h-3" />
              </button>
              {showPicker && (
                <div className="absolute top-9 right-0 z-20 w-64 bg-white rounded-xl shadow-lg border border-[--color-rule] p-2">
                  {hasNoMedia ? (
                    <div className="p-4 text-center">
                      <p className="text-xs text-[--color-ink-3] mb-2">No media uploaded yet.</p>
                      <Link href="/dashboard/analysis/new" className="text-xs font-bold text-blue-600">Upload Media →</Link>
                    </div>
                  ) : (
                    recentMedia.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => { setSelectedAsset(m.evidence_asset_id); setShowPicker(false); }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs font-semibold hover:bg-[--color-surface-2] transition-colors text-[--color-ink]"
                      >
                        <span className="truncate font-mono text-[10px]">{m.evidence_asset_id}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Live preview — 3 cols */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border-2 border-orange-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[--color-rule] flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600">Live Preview</p>
              <span className="text-[9px] font-bold text-orange-400 bg-orange-50 px-1.5 py-0.5 rounded-full">Cloudinary</span>
            </div>
            <div className="aspect-video relative bg-[--color-surface-2]">
              <CldImage
                src={selectedAsset}
                alt="Transformed preview"
                fill
                className="object-contain"
                width={parseInt(width) || 800}
                height={parseInt(height) || 600}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                crop={cropMode as any}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                gravity={gravity as any}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                format={format === "auto" ? undefined : format as any}
                quality={quality === "auto" ? "auto" : parseInt(quality)}
                blur={effect === "blur" ? "800" : undefined}
                grayscale={effect === "grayscale"}
              />
            </div>
          </div>

          {/* Generated URL */}
          <div className="bg-[--color-surface-2] rounded-xl border border-[--color-rule] p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[--color-ink-4]">Transformation URL</p>
              <button
                onClick={() => { navigator.clipboard.writeText(deliveryUrl); }}
                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline"
              >
                <Copy className="w-3 h-3" /> Copy URL
              </button>
            </div>
            <code className="text-[10px] font-mono text-[--color-ink] break-all leading-relaxed block">{deliveryUrl}</code>
          </div>
        </div>

        {/* Controls — 2 cols */}
        <div className="lg:col-span-2 space-y-4 max-h-[700px] overflow-y-auto pr-1">
          {/* Resize */}
          <div className="bg-white rounded-2xl border border-[--color-rule] shadow-sm p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[--color-ink-4] mb-3">Resize</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-[--color-ink-4] uppercase">Width</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 border border-[--color-rule] rounded-lg text-xs font-bold focus:outline-none focus:border-blue-400"
                  placeholder="px"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[--color-ink-4] uppercase">Height</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 border border-[--color-rule] rounded-lg text-xs font-bold focus:outline-none focus:border-blue-400"
                  placeholder="px"
                />
              </div>
            </div>
          </div>

          {/* Crop */}
          <div className="bg-white rounded-2xl border border-[--color-rule] shadow-sm p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[--color-ink-4] mb-3">Crop</p>
            <div className="grid grid-cols-2 gap-1.5">
              {["fill", "fit", "crop", "thumb", "scale"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCropMode(c)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition-all ${cropMode === c ? "bg-orange-50 border-orange-400 text-orange-700" : "border-[--color-rule] hover:bg-[--color-surface-2] text-[--color-ink]"}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <p className="text-[10px] font-bold text-[--color-ink-4] uppercase mb-2">Gravity</p>
              <div className="grid grid-cols-2 gap-1.5">
                {["auto", "center", "faces", "object"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGravity(g)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition-all ${gravity === g ? "bg-orange-50 border-orange-400 text-orange-700" : "border-[--color-rule] hover:bg-[--color-surface-2] text-[--color-ink]"}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Format & Quality */}
          <div className="bg-white rounded-2xl border border-[--color-rule] shadow-sm p-4 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[--color-ink-4] mb-2">Format</p>
              <div className="grid grid-cols-3 gap-1.5">
                {["auto", "jpg", "png", "webp", "avif"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${format === f ? "bg-blue-50 border-blue-400 text-blue-700" : "border-[--color-rule] hover:bg-[--color-surface-2] text-[--color-ink]"}`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[--color-ink-4] mb-2">Quality</p>
              <div className="grid grid-cols-3 gap-1.5">
                {["auto", "60", "75", "80", "90", "100"].map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${quality === q ? "bg-blue-50 border-blue-400 text-blue-700" : "border-[--color-rule] hover:bg-[--color-surface-2] text-[--color-ink]"}`}
                  >
                    {q === "auto" ? "Auto" : q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Effects */}
          <div className="bg-white rounded-2xl border border-[--color-rule] shadow-sm p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[--color-ink-4] mb-3">Effects</p>
            <div className="space-y-1.5">
              {EFFECTS.map((e) => (
                <button
                  key={e.value}
                  onClick={() => setEffect(e.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between border ${effect === e.value ? "bg-orange-50 border-orange-400 text-orange-700" : "border-[--color-rule] hover:bg-[--color-surface-2] text-[--color-ink]"}`}
                >
                  {e.label}
                  {effect === e.value && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
