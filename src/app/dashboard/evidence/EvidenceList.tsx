"use client";

import Link from "next/link";
import { CldImage } from "next-cloudinary";

export function EvidenceList({ analyses }: { analyses: Record<string, unknown>[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {analyses.map((analysis) => {
        const evidence = Array.isArray(analysis.evidence) ? analysis.evidence[0] : analysis.evidence;
        const publicId = evidence?.public_id;
        
        // Define colors based on severity
        let severityColor = "var(--color-low)";
        
        const overall_severity = String(analysis.overall_severity);
        if (overall_severity === "critical" || overall_severity === "high") {
          severityColor = "var(--color-critical)";
        } else if (analysis.overall_severity === "medium") {
          severityColor = "var(--color-medium)";
        }

        const dateFormatted = new Date(String(analysis.created_at)).toLocaleDateString(undefined, { 
          year: 'numeric', month: 'short', day: 'numeric' 
        });

        return (
          <Link href={`/dashboard/evidence/${analysis.id}`} key={String(analysis.id)} className="group block border border-[--color-rule] bg-[--color-surface] hover:border-[--color-ink-3] transition-colors relative overflow-hidden flex flex-col">
            <div className="w-full aspect-[4/3] bg-[--color-surface-2] relative border-b border-[--color-rule]">
              {publicId ? (
                <CldImage
                  src={String(publicId)}
                  alt={analysis.detected_evidence_type ? String(analysis.detected_evidence_type) : "Security Evidence"}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-technical text-xs text-[--color-ink-4]">No Image</div>
              )}
              
              <div className="absolute top-3 right-3 px-2 py-1 bg-[--color-surface] border border-[--color-rule] font-technical text-[10px] uppercase shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColor }}></span>
                {analysis.risk_score !== null ? `${String(analysis.risk_score)} / 100` : "N/A"}
              </div>
            </div>
            
            <div className="p-4 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-ui text-sm font-semibold text-[--color-ink] truncate pr-2">
                  {String(analysis.detected_evidence_type)}
                </h3>
              </div>
              <p className="font-technical text-[10px] uppercase text-[--color-ink-4] mt-auto">
                {dateFormatted}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
