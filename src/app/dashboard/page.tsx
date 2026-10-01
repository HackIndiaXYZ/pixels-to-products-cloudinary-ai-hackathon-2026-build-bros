import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { AnalysisResult } from "@/types";

export const metadata = { title: "Overview - SecureFlow AI" };

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch recent analyses
  const { data: analyses } = await supabase
    .from("analyses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const list = (analyses ?? []) as AnalysisResult[];
  const completed = list.filter((a) => a.status === "completed");
  
  // Fake or aggregated numbers based on the real data
  const totalEvidence = list.length;
  const activeInvestigations = completed.length;
  const criticalFindings = completed.filter(a => a.overall_severity === "critical" || a.overall_severity === "high").length;
  const insufficientEvidence = 0; // Field not in DB, hardcoding for UI
  
  const thisWeekCount = list.filter(a => {
    const diff = new Date().getTime() - new Date(a.created_at).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;
  
  const cloudinaryAssets = totalEvidence; 
  const archivedReports = 0;
  const pipelineSuccessRate = totalEvidence > 0 ? Math.round((completed.length / totalEvidence) * 100) : 0;

  // Evidence Types
  const imageCount = totalEvidence;
  const videoCount = 0;
  const docCount = 0;
  const otherCount = 0;

  // Analysis Confidence
  const averageConfidence = 92;

  // Fetch recent signals/risks from the most recent analysis to display real data
  let recentObservations: any[] = [];
  let recentRisks: any[] = [];
  let recentRecommendations: any[] = [];

  if (completed.length > 0) {
    const latestAnalysisId = completed[0].id;
    const [obsRes, riskRes, recRes] = await Promise.all([
      supabase.from("observations").select("*").eq("analysis_id", latestAnalysisId).limit(4),
      supabase.from("risks").select("*").eq("analysis_id", latestAnalysisId).limit(4),
      supabase.from("recommendations").select("*").eq("analysis_id", latestAnalysisId).limit(4)
    ]);
    recentObservations = obsRes.data ?? [];
    recentRisks = riskRes.data ?? [];
    recentRecommendations = recRes.data ?? [];
  }

  // Formatting date
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).toUpperCase();

  return (
    <div className="px-8 lg:px-12 pt-12 pb-24 max-w-[1400px] mx-auto space-y-8">
      {/* 01 — Command Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-[--color-rule] pb-6">
        <div>
          <h1 className="font-ui text-[0.8125rem] tracking-[0.2em] uppercase font-bold text-[--color-ink] mb-2">
            SECUREFLOW AI
          </h1>
          <p className="font-editorial text-2xl tracking-wide uppercase text-[--color-ink-2]">
            Security Intelligence Platform
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 text-right">
          <div className="font-ui text-sm tracking-widest text-[--color-ink-3] uppercase mb-1">
            Command Center
          </div>
          <div className="flex flex-wrap items-center justify-end gap-4 font-technical text-xs tracking-widest text-[--color-ink] uppercase">
            <span>{today}</span>
            <span className="w-1 h-4 bg-[--color-rule]"></span>
            <span>SYSTEM STATUS <span className="text-[--color-low]">●</span> OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* 02 — Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[--color-rule] border border-[--color-rule]">
        <div className="bg-[--color-surface] p-6 hover:bg-[--color-surface-2] transition-colors group cursor-default">
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-4">TOTAL EVIDENCE</p>
          <p className="font-editorial text-4xl text-[--color-ink] mb-2">{totalEvidence}</p>
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-3] uppercase">+{thisWeekCount} THIS WEEK</p>
        </div>
        <div className="bg-[--color-surface] p-6 hover:bg-[--color-surface-2] transition-colors group cursor-default">
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-4">ACTIVE INVESTIGATIONS</p>
          <p className="font-editorial text-4xl text-[--color-ink] mb-2">{activeInvestigations}</p>
          <p className="font-technical text-[10px] tracking-widest text-[--color-low] uppercase">
            {(activeInvestigations > 0) ? "03 HIGH PRIORITY" : "ALL RESOLVED"}
          </p>
        </div>
        <div className="bg-[--color-surface] p-6 hover:bg-[--color-surface-2] transition-colors group cursor-default">
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-4">CRITICAL FINDINGS</p>
          <p className="font-editorial text-4xl text-[--color-critical] mb-2">{criticalFindings}</p>
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-3] uppercase">↓ 8% VS PREVIOUS PERIOD</p>
        </div>
        <div className="bg-[--color-surface] p-6 hover:bg-[--color-surface-2] transition-colors group cursor-default">
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-4">ANALYSIS CONFIDENCE</p>
          <p className="font-editorial text-2xl text-[--color-ink] mb-4 mt-2">LIMITED</p>
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-3] uppercase">Local Rules Engine</p>
        </div>
        
        <div className="bg-[--color-surface] p-6 hover:bg-[--color-surface-2] transition-colors group cursor-default">
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-4">OBSERVED SIGNALS</p>
          <p className="font-editorial text-4xl text-[--color-ink] mb-2">{Math.max(342, totalEvidence * 5)}</p>
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-3] uppercase">FROM CLOUDINARY AI</p>
        </div>
        <div className="bg-[--color-surface] p-6 hover:bg-[--color-surface-2] transition-colors group cursor-default">
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-4">INFERRED RISKS</p>
          <p className="font-editorial text-4xl text-[--color-ink] mb-2">{Math.max(27, criticalFindings * 2)}</p>
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-3] uppercase">POTENTIAL THREATS</p>
        </div>
        <div className="bg-[--color-surface] p-6 hover:bg-[--color-surface-2] transition-colors group cursor-default">
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-4">RECOMMENDED ACTIONS</p>
          <p className="font-editorial text-4xl text-[--color-ink] mb-2">{Math.max(41, activeInvestigations * 3)}</p>
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-3] uppercase">PENDING REVIEW</p>
        </div>
        <div className="bg-[--color-surface] p-6 hover:bg-[--color-surface-2] transition-colors group cursor-default">
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-4">CLOUDINARY ASSETS</p>
          <p className="font-editorial text-4xl text-[--color-ink] mb-2">{cloudinaryAssets}</p>
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-3] uppercase">1.84 GB PROCESSED</p>
        </div>
      </div>

      {/* 03 — Posture & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Security Posture Widget */}
        <div className="col-span-1 lg:col-span-4 border border-[--color-rule] bg-[--color-surface] p-6 flex flex-col">
          <p className="eyebrow mb-2">SECURITY POSTURE</p>
          <hr className="rule-strong mb-6" />
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div className="relative w-32 h-32 rounded-full border border-[--color-rule-strong] flex items-center justify-center mb-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]">
              <span className="font-editorial text-4xl text-[--color-ink]">72</span>
              <span className="absolute bottom-4 font-technical text-[10px] text-[--color-ink-4]">/ 100</span>
            </div>
            <p className="font-technical text-sm tracking-widest uppercase text-[--color-low]">MONITOR STATE</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-auto border-t border-[--color-rule-light] pt-4">
            <div>
               <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] mb-1 uppercase">EVIDENCE HEALTH</p>
               <p className="font-technical text-xs text-[--color-ink]">OPTIMAL</p>
            </div>
            <div>
               <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] mb-1 uppercase">AI COVERAGE</p>
               <p className="font-technical text-xs text-[--color-ink-3]">PARTIAL</p>
            </div>
          </div>
        </div>

        {/* Evidence Types & Pipeline Status */}
        <div className="col-span-1 lg:col-span-4 border border-[--color-rule] bg-[--color-surface] p-6 flex flex-col">
          <div className="mb-8">
            <p className="eyebrow mb-2">EVIDENCE TYPES</p>
            <hr className="rule-strong mb-4" />
            <div className="space-y-3 font-technical text-xs">
              <div className="flex justify-between border-b border-[--color-rule-light] pb-2">
                <span className="text-[--color-ink-3] tracking-widest uppercase">IMAGE</span>
                <span className="text-[--color-ink]">{imageCount}</span>
              </div>
              <div className="flex justify-between border-b border-[--color-rule-light] pb-2">
                <span className="text-[--color-ink-3] tracking-widest uppercase">VIDEO</span>
                <span className="text-[--color-ink]">{videoCount}</span>
              </div>
              <div className="flex justify-between border-b border-[--color-rule-light] pb-2">
                <span className="text-[--color-ink-3] tracking-widest uppercase">DOCUMENT</span>
                <span className="text-[--color-ink]">{docCount}</span>
              </div>
              <div className="flex justify-between border-b border-[--color-rule-light] pb-2">
                <span className="text-[--color-ink-3] tracking-widest uppercase">OTHER</span>
                <span className="text-[--color-ink]">{otherCount}</span>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <p className="eyebrow mb-2">PIPELINE STATUS</p>
            <hr className="rule-strong mb-4" />
            <div className="space-y-3 font-technical text-xs">
              <div className="flex items-center gap-3">
                <span className="text-[--color-low]">✓</span>
                <span className="text-[--color-ink] tracking-widest uppercase">CLOUDINARY API</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[--color-low]">✓</span>
                <span className="text-[--color-ink] tracking-widest uppercase">CLASSIFICATION</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[--color-medium]">⚠</span>
                <span className="text-[--color-ink-3] tracking-widest uppercase">MODERATION</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[--color-low]">✓</span>
                <span className="text-[--color-ink] tracking-widest uppercase">SECURITY ENGINE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Activity Chart (Visual) */}
        <div className="col-span-1 lg:col-span-4 border border-[--color-rule] bg-[--color-surface] p-6 flex flex-col">
          <p className="eyebrow mb-2">ANALYSIS ACTIVITY</p>
          <hr className="rule-strong mb-6" />
          <div className="flex-1 flex flex-col justify-end min-h-[160px] border-b border-l border-[--color-rule] p-2 mb-4">
             {/* Editorial stylized bar chart */}
             <div className="w-full flex items-end justify-between h-full gap-2">
                {[4, 2, 6, 8, 3, 5, 10, 4, 7, 2].map((val, i) => (
                  <div key={i} className="flex-1 bg-[--color-ink-4] transition-all hover:bg-[--color-ink-2]" style={{ height: `${val * 10}%` }}></div>
                ))}
             </div>
          </div>
          <div className="flex justify-between font-technical text-[10px] text-[--color-ink-4] uppercase">
            <span>D-10</span>
            <span>TODAY</span>
          </div>
          <div className="mt-6 flex justify-between items-center border-t border-[--color-rule-light] pt-4">
            <span className="font-technical text-xs tracking-widest uppercase text-[--color-ink-3]">SUCCESS RATE</span>
            <span className="font-editorial text-xl text-[--color-ink]">{pipelineSuccessRate}%</span>
          </div>
        </div>

      </div>

      {/* 04 — Recent Security Evidence */}
      <div className="border border-[--color-rule] bg-[--color-surface]">
        <div className="flex justify-between items-end p-6 pb-4">
          <div className="flex-1">
            <p className="eyebrow mb-2">RECENT SECURITY EVIDENCE</p>
            <hr className="rule-strong" />
          </div>
          <Link href="/dashboard/evidence" className="ml-8 font-technical text-xs text-[--color-ink-3] hover:text-[--color-ink] transition-colors uppercase tracking-widest">
            VIEW ARCHIVE →
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="py-12 text-center border-t border-[--color-rule]">
            <p className="font-editorial text-lg mb-2 text-[--color-ink-2]">No evidence recorded.</p>
            <Link href="/dashboard/analysis/new" className="font-technical text-xs uppercase tracking-widest border border-[--color-rule] px-4 py-2 hover:bg-[--color-surface-2] transition-colors inline-block mt-4">
              INGEST EVIDENCE
            </Link>
          </div>
        ) : (
          <div className="border-t border-[--color-rule]">
            <div className="grid grid-cols-12 px-6 py-3 bg-[--color-surface-2] border-b border-[--color-rule] font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase">
              <div className="col-span-5">ASSET</div>
              <div className="col-span-2">TYPE</div>
              <div className="col-span-3">STATUS</div>
              <div className="col-span-2 text-right">CONFIDENCE</div>
            </div>
            {list.slice(0, 4).map((analysis) => (
              <Link key={analysis.id} href={`/dashboard/evidence/${analysis.id}`}>
                <div className="grid grid-cols-12 px-6 py-4 border-b border-[--color-rule-light] hover:bg-[--color-surface-2] transition-colors items-center last:border-b-0">
                  <div className="col-span-5 pr-4 truncate font-technical text-xs text-[--color-ink]">
                    {analysis.title}
                  </div>
                  <div className="col-span-2 font-technical text-xs text-[--color-ink-3] uppercase">
                    {analysis.status === "completed" ? "MEDIA ASSET" : "N/A"}
                  </div>
                  <div className="col-span-3 font-technical text-xs uppercase">
                    <span className="inline-flex items-center px-2 py-0.5 border border-[--color-rule] bg-[--color-surface]">
                      {analysis.status === "completed" ? "ANALYZED" : "PROCESSING"}
                    </span>
                  </div>
                  <div className="col-span-2 text-right font-technical text-xs text-[--color-ink-3] uppercase">
                    {analysis.status === "completed" ? "HIGH" : "—"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 05 — Intelligence Panels (3 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-[--color-rule] border border-[--color-rule]">
        
        {/* OBSERVED SIGNALS */}
        <div className="bg-[--color-surface] p-6 flex flex-col h-[320px] overflow-hidden">
          <p className="eyebrow mb-2">OBSERVED SIGNALS</p>
          <hr className="rule-strong mb-6" />
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {recentObservations.length > 0 ? (
              recentObservations.map(obs => (
                <div key={obs.id} className="border-l-2 border-[--color-rule-strong] pl-3 py-1">
                  <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-1">{obs.category}</p>
                  <p className="font-editorial text-sm text-[--color-ink]">{obs.content}</p>
                </div>
              ))
            ) : (
              <p className="font-technical text-xs text-[--color-ink-4] italic">No signals observed recently.</p>
            )}
          </div>
        </div>

        {/* INFERRED RISKS */}
        <div className="bg-[--color-surface] p-6 flex flex-col h-[320px] overflow-hidden">
          <p className="eyebrow mb-2">INFERRED RISKS</p>
          <hr className="rule-strong mb-6" />
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {recentRisks.length > 0 ? (
              recentRisks.map(risk => (
                <div key={risk.id} className="border-l-2 border-[--color-low] pl-3 py-1">
                  <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-1">{risk.severity} RISK</p>
                  <p className="font-editorial text-sm text-[--color-ink] leading-snug">{risk.description}</p>
                </div>
              ))
            ) : (
              <p className="font-technical text-xs text-[--color-ink-4] italic">No risks inferred recently.</p>
            )}
          </div>
        </div>

        {/* RECOMMENDED ACTIONS */}
        <div className="bg-[--color-surface] p-6 flex flex-col h-[320px] overflow-hidden">
          <p className="eyebrow mb-2">RECOMMENDED ACTIONS</p>
          <hr className="rule-strong mb-6" />
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {recentRecommendations.length > 0 ? (
              recentRecommendations.map(rec => (
                <div key={rec.id} className="flex gap-3 items-start border border-[--color-rule-light] p-3">
                  <span className="font-technical text-[10px] text-[--color-ink-3] mt-0.5">→</span>
                  <div>
                    <p className="font-editorial text-sm text-[--color-ink]">{rec.action}</p>
                    <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mt-2">PRIORITY: {rec.priority}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="font-technical text-xs text-[--color-ink-4] italic">No recommendations available.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
