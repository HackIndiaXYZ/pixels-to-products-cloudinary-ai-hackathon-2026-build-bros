"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";
import Link from "next/link";
import {
  Crop,
  ChevronDown,
  ArrowRight,
  ImageIcon,
  Check,
} from "lucide-react";

const FALLBACK_ASSET = "samples/people/kitchen-bar";

const CROP_MODES = [
  { value: "original", label: "Original", gravity: undefined, cloudinaryCrop: undefined },
  { value: "auto",     label: "AI Gravity", gravity: "auto",  cloudinaryCrop: "fill" },
  { value: "face",     label: "Face",       gravity: "faces", cloudinaryCrop: "thumb" },
  { value: "object",   label: "Object",     gravity: "object",cloudinaryCrop: "thumb" },
  { value: "center",   label: "Center",     gravity: "center",cloudinaryCrop: "fill" },
];

const PRESETS = [
  { label: "Original",  ratio: undefined },
  { label: "Square",    ratio: "1:1" },
  { label: "Portrait",  ratio: "3:4" },
  { label: "Landscape", ratio: "16:9" },
  { label: "Profile",   ratio: "1:1" },
  { label: "Social",    ratio: "4:5" },
];

interface SmartCropClientProps {
  defaultAssetId: string;
  recentMedia: { id: string; evidence_asset_id: string }[];
}

export function SmartCropClient({ defaultAssetId, recentMedia }: SmartCropClientProps) {
  const assetId = defaultAssetId || FALLBACK_ASSET;
  const [selectedAsset, setSelectedAsset] = useState(assetId);
  const [cropMode, setCropMode] = useState("auto");
  const [preset, setPreset] = useState("Square");
  const [showPicker, setShowPicker] = useState(false);

  const activeCropMode = CROP_MODES.find((m) => m.value === cropMode) ?? CROP_MODES[1];
  const activePreset = PRESETS.find((p) => p.label === preset) ?? PRESETS[1];

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
                    <>
                      <p className="text-[9px] font-bold uppercase text-[--color-ink-4] px-2 py-1">Recent Media</p>
                      {recentMedia.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => { setSelectedAsset(m.evidence_asset_id); setShowPicker(false); }}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs font-semibold hover:bg-[--color-surface-2] transition-colors ${selectedAsset === m.evidence_asset_id ? "text-blue-600" : "text-[--color-ink]"}`}
                        >
                          {selectedAsset === m.evidence_asset_id && <Check className="w-3 h-3 flex-shrink-0" />}
                          <span className="truncate font-mono text-[10px]">{m.evidence_asset_id}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Preview — 3 cols */}
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Original */}
            <div className="bg-white rounded-2xl border border-[--color-rule] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[--color-rule]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[--color-ink-4]">Original</p>
              </div>
              <div className="aspect-square relative bg-[--color-surface-2]">
                <CldImage src={selectedAsset} alt="Original" fill className="object-cover" />
              </div>
            </div>

            {/* Result */}
            <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[--color-rule] flex items-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Result</p>
                <span className="text-[9px] font-bold text-blue-400 bg-blue-50 px-1.5 py-0.5 rounded-full">Cloudinary</span>
              </div>
              <div className="aspect-square relative bg-[--color-surface-2]">
                {cropMode === "original" ? (
                  <CldImage src={selectedAsset} alt="Result" fill className="object-cover" />
                ) : (
                  <CldImage
                    src={selectedAsset}
                    alt="Result"
                    fill
                    className="object-cover"
                    crop={activeCropMode.cloudinaryCrop as any}
                    gravity={activeCropMode.gravity as any}
                    aspectRatio={activePreset.ratio}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Transformation summary */}
          <div className="bg-[--color-surface-2] rounded-xl border border-[--color-rule] p-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[--color-ink-4] mb-2">
              Active Transformation
            </p>
            <div className="flex flex-wrap gap-2">
              <code className="text-[10px] font-mono bg-white border border-[--color-rule] rounded px-2 py-0.5 text-blue-600">
                crop: {activeCropMode.cloudinaryCrop ?? "none"}
              </code>
              {activeCropMode.gravity && (
                <code className="text-[10px] font-mono bg-white border border-[--color-rule] rounded px-2 py-0.5 text-violet-600">
                  gravity: {activeCropMode.gravity}
                </code>
              )}
              {activePreset.ratio && (
                <code className="text-[10px] font-mono bg-white border border-[--color-rule] rounded px-2 py-0.5 text-emerald-600">
                  ar: {activePreset.ratio}
                </code>
              )}
            </div>
          </div>
        </div>

        {/* Controls — 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Crop mode */}
          <div className="bg-white rounded-2xl border border-[--color-rule] shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[--color-ink-4] mb-3">
              Crop Mode
            </p>
            <div className="space-y-1.5">
              {CROP_MODES.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setCropMode(mode.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                    cropMode === mode.value
                      ? "bg-blue-600 text-white"
                      : "hover:bg-[--color-surface-2] text-[--color-ink]"
                  }`}
                >
                  {mode.label}
                  {cropMode === mode.value && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div className="bg-white rounded-2xl border border-[--color-rule] shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[--color-ink-4] mb-3">
              Preset
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setPreset(p.label)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                    preset === p.label
                      ? "bg-blue-50 border-blue-400 text-blue-700"
                      : "border-[--color-rule] hover:bg-[--color-surface-2] text-[--color-ink]"
                  }`}
                >
                  {p.label}
                  {p.ratio && <span className="block text-[9px] opacity-60">{p.ratio}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Cloudinary note */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-1">
              Powered by Cloudinary
            </p>
            <p className="text-[11px] text-blue-600">
              Transformations are applied via real Cloudinary delivery parameters — not CSS.
              The result image is generated by Cloudinary&apos;s AI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
