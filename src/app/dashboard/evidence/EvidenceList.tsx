"use client";

import Link from "next/link";
import { CldImage } from "next-cloudinary";

export function EvidenceList({ analyses }: { analyses: Record<string, unknown>[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {analyses.map((analysis) => {
        const evidence = Array.isArray(analysis.evidence) ? analysis.evidence[0] : analysis.evidence;
        const publicId = evidence?.public_id;
        
        const isSafe = analysis.overall_severity === 'low';
        const isReview = analysis.overall_severity === 'medium';
        const isFlagged = analysis.overall_severity === 'high' || analysis.overall_severity === 'critical';

        let statusText = "SAFE";
        let statusColor = "text-[--color-healthy]";
        if (isReview) { statusText = "REVIEW"; statusColor = "text-[--color-medium]"; }
        if (isFlagged) { statusText = "FLAGGED"; statusColor = "text-[--color-warning]"; }

        return (
          <Link href={`/dashboard/evidence/${analysis.id}`} key={String(analysis.id)} className="group block bg-white border border-[--color-rule-light] rounded-xl overflow-hidden hover:border-[--color-ink-3] hover:shadow-md transition-all flex flex-col">
            <div className="w-full aspect-square bg-[--color-surface-2] relative border-b border-[--color-rule-light]">
              {publicId ? (
                <CldImage
                  src={String(publicId)}
                  alt={analysis.detected_evidence_type ? String(analysis.detected_evidence_type) : "Security Evidence"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-technical text-xs text-[--color-ink-4]">No Image</div>
              )}
            </div>
            
            <div className="p-3">
              <div className="flex justify-between items-center mb-1">
                <span className={`text-[10px] font-bold tracking-widest uppercase ${statusColor}`}>
                  {statusText}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-[--color-ink-3] truncate">
                {String(analysis.detected_evidence_type) || "Unknown Media"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
