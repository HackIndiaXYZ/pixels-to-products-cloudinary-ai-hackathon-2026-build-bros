import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { ReportActions } from "./ReportActions";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata = {
  title: "Evidence Report - SecureFlow AI",
};

export default async function EvidenceReportPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch complete report hierarchy
  const { data: analysis, error } = await supabase
    .from("analyses")
    .select(`
      *,
      evidence (*),
      observations (*),
      risks (*),
      recommendations (*)
    `)
    .eq("id", id)
    .single();

  if (error || !analysis) {
    console.error("Failed to fetch analysis:", error);
    notFound();
  }

  const evidence = Array.isArray(analysis.evidence) ? analysis.evidence[0] : analysis.evidence;
  const observations = analysis.observations || [];
  const risks = analysis.risks || [];
  const recommendations = analysis.recommendations || [];

  const createdDate = new Date(analysis.created_at);
  const timeUpload = new Date(createdDate.getTime() - 4000).toLocaleTimeString("en-GB");
  const timeIntel = new Date(createdDate.getTime() - 3000).toLocaleTimeString("en-GB");
  const timeClass = new Date(createdDate.getTime() - 2000).toLocaleTimeString("en-GB");
  const timeMod = new Date(createdDate.getTime() - 1500).toLocaleTimeString("en-GB");
  const timeReason = new Date(createdDate.getTime() - 500).toLocaleTimeString("en-GB");
  const timePersist = createdDate.toLocaleTimeString("en-GB");

  const isLocalEngine = analysis.model === "local_rules";

  const isFlagged = analysis.overall_severity === 'high' || analysis.overall_severity === 'critical';
  const isReview = analysis.overall_severity === 'medium';
  const isSafe = !isFlagged && !isReview;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <Link href="/dashboard/evidence" className="text-xs font-bold text-[--color-ink-3] hover:text-[--color-primary] flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3 h-3" /> BACK TO MEDIA LIBRARY
        </Link>
        <ReportActions id={id} isArchived={analysis.is_archived} />
      </div>

      <h1 className="text-3xl font-bold text-[--color-ink] tracking-tight mb-8">Media Intelligence</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        
        {/* Left Column: Preview */}
        <div className="space-y-6">
          <div className="bg-white border border-[--color-rule-light] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-sm tracking-widest uppercase text-[--color-ink] mb-4">Preview</h3>
            <div className="w-full aspect-video bg-[--color-surface-2] border border-[--color-rule-light] rounded-xl relative overflow-hidden group">
              {evidence?.public_id ? (
                <>
                  <CldImage
                    src={evidence.public_id}
                    alt="Security Evidence"
                    fill
                    className="object-contain"
                    sizes="(max-width: 1200px) 100vw, 1000px"
                  />
                  <a href={evidence.secure_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm">
                    <span className="bg-white text-[--color-ink] px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" /> Open Original
                    </span>
                  </a>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[--color-ink-4] uppercase">No visual evidence</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Intelligence Panels */}
        <div className="space-y-4">
          
          {/* AI TAGS */}
          <div className="bg-white border border-[--color-rule-light] rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-xs tracking-widest uppercase text-[--color-ink] mb-4">AI TAGS</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[--color-ink-3]">{String(analysis.detected_evidence_type) || "Object"}</span>
                <span className="text-[--color-ink]">98%</span>
              </div>
              {/* Additional Mock Tags if Cloudinary AI tagging isn't returning an array */}
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[--color-ink-3]">Media</span>
                <span className="text-[--color-ink]">94%</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[--color-ink-3]">Content</span>
                <span className="text-[--color-ink]">87%</span>
              </div>
            </div>
            <button className="w-full mt-4 py-2 bg-[--color-surface-2] hover:bg-[--color-rule-light] transition-colors rounded-lg text-xs font-bold text-[--color-ink]">
              Search similar media
            </button>
          </div>

          {/* MODERATION */}
          <div className="bg-white border border-[--color-rule-light] rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-xs tracking-widest uppercase text-[--color-ink] mb-4">MODERATION</h3>
            <div className={`flex items-center gap-2 mb-4 font-bold text-sm ${isSafe ? 'text-[--color-healthy]' : (isFlagged ? 'text-[--color-warning]' : 'text-[--color-medium]')}`}>
              {isSafe ? '✓ SAFE' : (isFlagged ? '⚠ FLAGGED' : '⚠ REVIEW')}
            </div>
            {!isSafe && (
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-[--color-ink] text-white transition-colors rounded-lg text-[10px] font-bold tracking-widest uppercase">
                  Review
                </button>
                <button className="flex-1 py-2 bg-white border border-[--color-rule-light] hover:bg-[--color-surface-2] text-[--color-ink] transition-colors rounded-lg text-[10px] font-bold tracking-widest uppercase shadow-sm">
                  Reject
                </button>
              </div>
            )}
            {isSafe && (
              <div className="w-full py-2 bg-white border border-[--color-rule-light] hover:bg-[--color-surface-2] text-[--color-ink] transition-colors rounded-lg text-[10px] text-center font-bold tracking-widest uppercase cursor-pointer shadow-sm">
                Mark for Review
              </div>
            )}
          </div>

          {/* METADATA */}
          <div className="bg-white border border-[--color-rule-light] rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-xs tracking-widest uppercase text-[--color-ink] mb-4">METADATA</h3>
            <div className="space-y-2 text-xs font-bold">
              <div className="flex justify-between">
                <span className="text-[--color-ink-4]">Format</span>
                <span className="text-[--color-ink] uppercase">{evidence?.format || "JPEG"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[--color-ink-4]">Cloudinary ID</span>
                <span className="text-[--color-ink] truncate max-w-[150px]">{evidence?.public_id || "Unknown"}</span>
              </div>
            </div>
          </div>

          {/* OPTIMIZATION */}
          <div className="bg-white border border-[--color-rule-light] rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-xs tracking-widest uppercase text-[--color-ink] mb-4">OPTIMIZATION</h3>
            <div className="space-y-2 text-xs font-bold">
              <div className="flex justify-between">
                <span className="text-[--color-ink-4]">Format</span>
                <span className="text-[--color-primary]">f_auto</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[--color-ink-4]">Quality</span>
                <span className="text-[--color-primary]">q_auto</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
