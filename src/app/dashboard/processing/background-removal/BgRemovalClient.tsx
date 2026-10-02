"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";
import Link from "next/link";
import { Layers, Check, ChevronDown, AlertCircle, ExternalLink } from "lucide-react";

const FALLBACK_ASSET = "samples/people/kitchen-bar";

interface BgRemovalClientProps {
  defaultAssetId: string;
  recentMedia: { id: string; evidence_asset_id: string }[];
  cloudinaryConfigured: boolean;
}

export function BgRemovalClient({
  defaultAssetId,
  recentMedia,
  cloudinaryConfigured,
}: BgRemovalClientProps) {
  const assetId = defaultAssetId || FALLBACK_ASSET;
  const [selectedAsset, setSelectedAsset] = useState(assetId);
  const [showResult, setShowResult] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const handleRemoveBg = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setShowResult(true);
    }, 1500);
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
                  <>
                    <p className="text-[9px] font-bold uppercase text-[--color-ink-4] px-2 py-1">Recent Media</p>
                    {recentMedia.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedAsset(m.evidence_asset_id);
                          setShowPicker(false);
                          setShowResult(false);
                        }}
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

      {/* Cloudinary add-on notice */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-amber-700 mb-0.5">
            Cloudinary Background Removal Add-on Required
          </p>
          <p className="text-[11px] text-amber-600">
            Background removal requires the Cloudinary AI Background Removal add-on to be enabled on your account.
            The transformation uses <code className="font-mono">e_background_removal</code>.
            If your account has this add-on, the result preview will show the processed image.
          </p>
        </div>
      </div>

      {/* Main workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Preview panels — 3 cols */}
        <div className="lg:col-span-3 grid grid-cols-2 gap-4">
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
          <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden ${showResult ? "border-violet-300" : "border-[--color-rule]"}`}>
            <div className="px-4 py-3 border-b border-[--color-rule] flex items-center gap-2">
              <p className={`text-[10px] font-bold uppercase tracking-widest ${showResult ? "text-violet-600" : "text-[--color-ink-4]"}`}>
                {showResult ? "Result" : "Preview"}
              </p>
              {showResult && (
                <span className="text-[9px] font-bold text-violet-400 bg-violet-50 px-1.5 py-0.5 rounded-full">
                  Background Removed
                </span>
              )}
            </div>
            <div className="aspect-square relative">
              {/* Checkerboard pattern for transparency */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                }}
              />
              {processing ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold text-violet-600">Processing...</p>
                  </div>
                </div>
              ) : showResult ? (
                <CldImage
                  src={selectedAsset}
                  alt="Background removed"
                  fill
                  className="object-contain relative z-10"
                  removeBackground
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-xs text-[--color-ink-4] text-center px-4">
                    Click &ldquo;Remove Background&rdquo; to process
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls — 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-[--color-rule] shadow-sm p-5 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[--color-ink-4]">
              Processing
            </p>

            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${processing ? "bg-amber-400 animate-pulse" : showResult ? "bg-emerald-500" : "bg-[--color-rule]"}`} />
              <span className="text-xs font-bold text-[--color-ink]">
                {processing ? "Processing…" : showResult ? "Complete" : "Ready"}
              </span>
            </div>

            {/* Action */}
            {!showResult ? (
              <button
                onClick={handleRemoveBg}
                disabled={processing}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  processing
                    ? "bg-[--color-surface-2] text-[--color-ink-4] cursor-not-allowed"
                    : "bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
                }`}
              >
                <Layers className="w-4 h-4" />
                {processing ? "Removing Background…" : "Remove Background"}
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => setShowResult(false)}
                  className="w-full py-2 rounded-xl text-xs font-bold border border-[--color-rule] hover:bg-[--color-surface-2] transition-colors text-[--color-ink]"
                >
                  Reset
                </button>
                <p className="text-[10px] text-center text-[--color-ink-4]">
                  Download functionality requires the Cloudinary SDK configured on your account.
                </p>
              </div>
            )}
          </div>

          {/* Transformation info */}
          <div className="bg-[--color-surface-2] rounded-xl border border-[--color-rule] p-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[--color-ink-4] mb-2">
              Cloudinary Transformation
            </p>
            <code className="text-[10px] font-mono bg-white border border-[--color-rule] rounded px-2 py-0.5 text-violet-600 block">
              e_background_removal
            </code>
            <p className="text-[10px] text-[--color-ink-4] mt-2">
              Applied via <strong>removeBackground</strong> prop on CldImage.
              Requires the AI Background Removal add-on.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
