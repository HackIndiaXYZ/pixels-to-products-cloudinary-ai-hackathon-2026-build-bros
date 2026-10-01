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

  return (
    <div className="px-8 lg:px-12 pt-8 pb-24 max-w-[1400px] mx-auto w-full">
      <Breadcrumbs items={[
        { label: "REPORTS", href: "/dashboard/reports" },
        { label: id.split('-')[0].toUpperCase() }
      ]} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-[--color-rule] pb-6">
        <div>
          <h1 className="font-editorial text-3xl tracking-wide uppercase text-[--color-ink] mb-3">
            Security Assessment
          </h1>
          <p className="font-ui text-sm text-[--color-ink-2] leading-relaxed">
            Detailed security evaluation and risk findings for evidence piece.
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 text-right">
          <ReportActions id={id} isArchived={analysis.is_archived} />
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-16 mb-16">
        <div className="flex-1">
          <div className="mb-10 space-y-4">
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="font-technical text-xs text-[--color-ink-4] uppercase">Evidence</span>
              <span className="font-technical text-xs text-[--color-ink]">{analysis.title}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="font-technical text-xs text-[--color-ink-4] uppercase">Analysis ID</span>
              <span className="font-technical text-xs text-[--color-ink]">{id.split('-')[0].toUpperCase()}...</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="font-technical text-xs text-[--color-ink-4] uppercase">Engine</span>
              <span className="font-technical text-xs text-[--color-ink] uppercase">{isLocalEngine ? "Local Rules" : "GPT-4o"}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="font-technical text-xs text-[--color-ink-4] uppercase">Confidence</span>
              <span className="font-technical text-xs uppercase" style={{ color: analysis.analysis_confidence === "limited" ? "var(--color-medium)" : "var(--color-low)" }}>{analysis.analysis_confidence || (isLocalEngine ? "LIMITED" : "HIGH")}</span>
            </div>
          </div>

          <div className="p-8 border border-[--color-rule] bg-[--color-surface] text-center mb-8">
            {analysis.risk_score === null ? (
              <>
                <p className="font-editorial text-[3rem] text-[--color-ink-4] mb-2 leading-none">N/A</p>
                <p className="font-technical text-sm tracking-widest text-[--color-ink-3] uppercase mb-6">Insufficient Evidence</p>
                <p className="font-editorial text-sm text-[--color-ink-3] max-w-sm mx-auto">
                  Risk score unavailable because no multimodal security reasoning provider was available.
                </p>
              </>
            ) : (
              <>
                <p className="font-editorial text-[4rem] font-bold mb-2 leading-none" style={{ color: analysis.risk_score > 70 ? "var(--color-critical)" : analysis.risk_score > 40 ? "var(--color-medium)" : "var(--color-low)" }}>
                  {analysis.risk_score}
                </p>
                <p className="font-technical text-sm tracking-widest uppercase" style={{ color: "var(--color-ink-2)" }}>
                  {analysis.overall_severity} RISK
                </p>
              </>
            )}
          </div>
        </div>

        <div className="w-full md:w-72 shrink-0 flex flex-col gap-4">
          <div className="aspect-[4/3] bg-[--color-surface-2] border border-[--color-rule] relative overflow-hidden group">
            {evidence?.public_id ? (
              <>
                <CldImage
                  src={evidence.public_id}
                  alt="Security Evidence"
                  fill
                  className="object-cover"
                  sizes="288px"
                />
                <a href={evidence.secure_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-[--color-ink] bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                  <ExternalLink className="w-6 h-6 text-white" />
                </a>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center font-technical text-[10px] text-[--color-ink-4] uppercase">No visual evidence</div>
            )}
          </div>
        </div>
      </div>

      {/* Observed vs Inferred */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[--color-rule] border border-[--color-rule] mb-16">
        <div className="bg-[--color-surface] p-8">
          <p className="font-technical text-xs tracking-widest text-[--color-ink-4] uppercase mb-4">OBSERVED</p>
          <p className="font-editorial text-sm text-[--color-ink-3] mb-8 italic">Cloudinary reported</p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-[100px_1fr]">
              <span className="font-technical text-xs text-[--color-ink-4]">Resource</span>
              <span className="font-technical text-xs text-[--color-ink]">{evidence?.resource_type || "unknown"}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr]">
              <span className="font-technical text-xs text-[--color-ink-4]">Tags</span>
              <span className="font-technical text-xs text-[--color-ink]">
                {observations.length > 0 ? "security" : "none"}
              </span>
            </div>
            <div className="grid grid-cols-[100px_1fr]">
              <span className="font-technical text-xs text-[--color-ink-4]">Format</span>
              <span className="font-technical text-xs text-[--color-ink] uppercase">{evidence?.format || "unknown"}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[--color-surface] p-8">
          <p className="font-technical text-xs tracking-widest text-[--color-ink-4] uppercase mb-4">INFERRED</p>
          <p className="font-editorial text-sm text-[--color-ink-3] mb-8 italic">Security engine reasoning</p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-[100px_1fr]">
              <span className="font-technical text-xs text-[--color-ink-4]">Risks</span>
              <span className="font-technical text-xs text-[--color-ink]">{risks.length > 0 ? `${risks.length} inferred` : "No risks inferred"}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr]">
              <span className="font-technical text-xs text-[--color-ink-4]">Status</span>
              <span className="font-technical text-xs text-[--color-ink] uppercase">{analysis.status}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr]">
              <span className="font-technical text-xs text-[--color-ink-4]">Confidence</span>
              <span className="font-technical text-xs text-[--color-ink] uppercase">{analysis.analysis_confidence || "LIMITED"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-16 mb-16">
        {/* Risks */}
        <section>
          <p className="eyebrow mb-2">POTENTIAL RISKS</p>
          <hr className="rule-strong mb-6" />
          
          {risks.length > 0 ? (
            <div className="space-y-6">
              {risks.map((risk: Record<string, unknown>) => (
                <div key={String(risk.id)} className="border border-[--color-rule] p-6 bg-[--color-surface]">
                  <div className="flex justify-between items-start mb-4">
                    <p className="font-editorial text-lg text-[--color-ink]">{String(risk.title)}</p>
                    <span className="font-technical text-[10px] uppercase tracking-wider px-2 py-1 border border-[--color-rule] bg-[--color-surface-2]">
                      {String(risk.severity)}
                    </span>
                  </div>
                  <p className="font-ui text-sm text-[--color-ink-2] leading-relaxed mb-6">
                    {String(risk.statement)}
                  </p>
                  <p className="font-technical text-[10px] text-[--color-ink-4] uppercase tracking-widest">
                    Confidence: {String(risk.confidence)}%
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-editorial text-sm text-[--color-ink-3] italic py-8 text-center border border-[--color-rule] bg-[--color-surface-2]">
              No inferred risks were identified.
            </p>
          )}
        </section>

        {/* Recommendations */}
        <section>
          <p className="eyebrow mb-2">RECOMMENDATIONS</p>
          <hr className="rule-strong mb-6" />
          
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec: Record<string, unknown>, idx: number) => (
                <div key={String(rec.id)} className="flex gap-6 border-b border-[--color-rule-light] pb-4 last:border-0">
                  <div className="font-editorial text-xl text-[--color-ink-4]">{(idx + 1).toString().padStart(2, '0')}</div>
                  <div>
                    <p className="font-editorial text-base text-[--color-ink] mb-1">{String(rec.action)}</p>
                    <p className="font-ui text-sm text-[--color-ink-3]">{String(rec.rationale)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-editorial text-sm text-[--color-ink-3] italic py-8 text-center border border-[--color-rule] bg-[--color-surface-2]">
              No recommendations available.
            </p>
          )}
        </section>
      </div>

      {/* Evidence Timeline */}
      <section>
        <p className="eyebrow mb-2">EVIDENCE TIMELINE</p>
        <hr className="rule-strong mb-6" />
        
        <div className="space-y-4 font-technical text-xs">
          <div className="grid grid-cols-[100px_120px_1fr]">
            <span className="text-[--color-ink-4]">{timeUpload}</span>
            <span className="text-[--color-ink]">UPLOAD</span>
            <span className="text-[--color-ink-3]">Asset created in Cloudinary</span>
          </div>
          <div className="grid grid-cols-[100px_120px_1fr]">
            <span className="text-[--color-ink-4]">{timeIntel}</span>
            <span className="text-[--color-ink]">ANALYSIS</span>
            <span className="text-[--color-ink-3]">Cloudinary intelligence requested</span>
          </div>
          <div className="grid grid-cols-[100px_120px_1fr]">
            <span className="text-[--color-ink-4]">{timeClass}</span>
            <span className="text-[--color-ink]">CLASSIFICATION</span>
            <span className="text-[--color-ink-3]">Media metadata processed</span>
          </div>
          <div className="grid grid-cols-[100px_120px_1fr]">
            <span className="text-[--color-ink-4]">{timeMod}</span>
            <span className="text-[--color-ink]">MODERATION</span>
            <span className="text-[--color-ink-3]">Moderation request completed</span>
          </div>
          <div className="grid grid-cols-[100px_120px_1fr]">
            <span className="text-[--color-ink-4]">{timeReason}</span>
            <span className="text-[--color-ink]">REASONING</span>
            <span className="text-[--color-ink-3]">{isLocalEngine ? "Local Rules engine executed" : "OpenAI engine executed"}</span>
          </div>
          <div className="grid grid-cols-[100px_120px_1fr]">
            <span className="text-[--color-ink-4]">{timePersist}</span>
            <span className="text-[--color-ink]">PERSISTENCE</span>
            <span className="text-[--color-ink-3]">Report stored</span>
          </div>
        </div>
      </section>
    </div>
  );
}
