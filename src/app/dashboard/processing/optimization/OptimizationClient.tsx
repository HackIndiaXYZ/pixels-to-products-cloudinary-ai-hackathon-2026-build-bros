"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";
import Link from "next/link";
import { Zap, Check, ChevronDown, Copy, ExternalLink } from "lucide-react";

const FALLBACK_ASSET = "samples/people/kitchen-bar";

const FORMATS = ["auto", "jpg", "png", "webp", "avif"] as const;
const QUALITIES = ["auto", "low", "medium", "high"] as const;

type Format = typeof FORMATS[number];
type Quality = typeof QUALITIES[number];

const QUALITY_MAP: Record<Quality, string | number> = {
  auto: "auto",
  low: 40,
  medium: 70,
  high: 90,
};

interface OptimizationClientProps {
  defaultAssetId: string;
  recentMedia: { id: string; evidence_asset_id: string }[];
}

export function OptimizationClient({ defaultAssetId, recentMedia }: OptimizationClientProps) {
  const assetId = defaultAssetId || FALLBACK_ASSET;
  const [selectedAsset, setSelectedAsset] = useState(assetId);
  const [format, setFormat] = useState<Format>("auto");
  const [quality, setQuality] = useState<Quality>("auto");
  const [showPicker, setShowPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "demo";
  const formatParam = format === "auto" ? "f_auto" : `f_${format}`;
  const qualityParam = quality === "auto" ? "q_auto" : `q_${QUALITY_MAP[quality]}`;
  const deliveryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${formatParam},${qualityParam}/${selectedAsset}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(deliveryUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Preview — 3 cols */}
        <div className="lg:col-span-3 space-y-4">
          {/* Live preview */}
          <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[--color-rule] flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                Optimized Preview
              </p>
              <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                {formatParam} · {qualityParam}
              </span>
            </div>
            <div className="aspect-video relative bg-[--color-surface-2]">
              <CldImage
                src={selectedAsset}
                alt="Optimized preview"
                fill
                className="object-contain"
                format={format === "auto" ? undefined : format as "jpg" | "png" | "webp" | "avif"}
                quality={quality === "auto" ? "auto" : (QUALITY_MAP[quality] as number)}
              />
            </div>
          </div>

          {/* Delivery URL */}
          <div className="bg-[--color-surface-2] rounded-xl border border-[--color-rule] p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[--color-ink-4]">
                Cloudinary Delivery URL
              </p>
              <div className="flex gap-2">
                <button
                  onClick={copyUrl}
                  className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <a
                  href={deliveryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] font-bold text-[--color-ink-3] hover:text-[--color-ink]"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open
                </a>
              </div>
            </div>
            <code className="text-[10px] font-mono text-[--color-ink] break-all leading-relaxed block">
              {deliveryUrl}
            </code>
          </div>

          {/* Honest note about file sizes */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs font-bold text-blue-700 mb-1">
              About Optimization Savings
            </p>
            <p className="text-[11px] text-blue-600">
              File size savings depend on your original asset format, quality, and Cloudinary account settings.
              Actual savings can only be measured after delivery. The preview above uses real Cloudinary
              transformation parameters — no fake percentages are shown.
            </p>
          </div>
        </div>

        {/* Controls — 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Format */}
          <div className="bg-white rounded-2xl border border-[--color-rule] shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[--color-ink-4] mb-3">Format</p>
            <div className="grid grid-cols-2 gap-1.5">
              {FORMATS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                    format === f
                      ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                      : "border-[--color-rule] hover:bg-[--color-surface-2] text-[--color-ink]"
                  }`}
                >
                  {f === "auto" ? "Auto (Recommended)" : f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div className="bg-white rounded-2xl border border-[--color-rule] shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[--color-ink-4] mb-3">Quality</p>
            <div className="grid grid-cols-2 gap-1.5">
              {QUALITIES.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                    quality === q
                      ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                      : "border-[--color-rule] hover:bg-[--color-surface-2] text-[--color-ink]"
                  }`}
                >
                  {q === "auto" ? "Auto" : q.charAt(0).toUpperCase() + q.slice(1)}
                  {q !== "auto" && <span className="block text-[9px] opacity-60">q_{QUALITY_MAP[q]}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Active params */}
          <div className="bg-[--color-surface-2] rounded-xl border border-[--color-rule] p-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[--color-ink-4] mb-2">
              Active Parameters
            </p>
            <div className="flex flex-wrap gap-2">
              <code className="text-[10px] font-mono bg-white border border-[--color-rule] rounded px-2 py-0.5 text-emerald-600">{formatParam}</code>
              <code className="text-[10px] font-mono bg-white border border-[--color-rule] rounded px-2 py-0.5 text-blue-600">{qualityParam}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
