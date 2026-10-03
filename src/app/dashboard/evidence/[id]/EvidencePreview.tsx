"use client";

import { CldImage } from "next-cloudinary";
import { ExternalLink } from "lucide-react";

interface EvidencePreviewProps {
  publicId: string | null;
  secureUrl: string | null;
}

export function EvidencePreview({ publicId, secureUrl }: EvidencePreviewProps) {
  if (!publicId) {
    return (
      <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[--color-ink-4] uppercase">
        No visual evidence
      </div>
    );
  }

  return (
    <>
      <CldImage
        src={publicId}
        alt="Security Evidence"
        fill
        className="object-contain"
        sizes="(max-width: 1200px) 100vw, 1000px"
      />
      {secureUrl && (
        <a
          href={secureUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 bg-black/40 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
        >
          <span className="bg-white text-[--color-ink] px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2">
            <ExternalLink className="w-4 h-4" /> Open Original
          </span>
        </a>
      )}
    </>
  );
}
