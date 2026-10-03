"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, UploadCloud, ImageIcon, FileTextIcon, CheckCircle2, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CldImage, CldVideoPlayer } from "next-cloudinary";
import type { SecurityEvidence } from "@/lib/cloudinary/types";

const MAX_TEXT = 50000;
const EXAMPLES = [
  { label: "Terraform", content: `resource "aws_s3_bucket" "data" { bucket = "company-sensitive-data"\n acl = "public-read" }` },
  { label: "Dockerfile", content: `FROM ubuntu:latest\nENV DATABASE_URL=postgres://admin:password123@prod-db\nUSER root` },
];

type Mode = "evidence" | "text";

type UploadState = "EMPTY" | "UPLOADING" | "UPLOADED" | "ANALYZING" | "CLASSIFYING" | "MODERATING" | "READY" | "RULE_EVALUATION" | "DONE" | "ERROR";

interface MediaIntelligence {
  detectedContent?: string | null;
  tags?: string[];
  moderation?: string;
  metadata?: Record<string, string>;
  diagnostics?: Record<string, string>;
}

import type { SecurityAnalysisResult } from "@/lib/ai/schemas";

export function AnalysisForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("evidence");
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Evidence state
  const [uploadState, setUploadState] = useState<UploadState>("EMPTY");
  const [evidence, setEvidence] = useState<SecurityEvidence | null>(null);
  const [intelligence, setIntelligence] = useState<MediaIntelligence>({});
  const [securityResult, setSecurityResult] = useState<SecurityAnalysisResult | null>(null);
  const [dragging, setDragging] = useState(false);

  // Text state
  const [content, setContent] = useState("");

  async function handleMediaUpload(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds 10MB limit.");
      return;
    }
    setError(null);
    setUploadState("UPLOADING");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. UPLOAD
      const uploadRes = await fetch("/api/media/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");
      
      const asset = uploadData.asset as SecurityEvidence;
      setEvidence(asset);
      if (!title) setTitle(`Evidence: ${file.name}`);
      
      const basePayload = { assetId: asset.assetId, publicId: asset.publicId, resourceType: asset.resourceType };
      const newIntel: MediaIntelligence = { diagnostics: {} };

      // 2. ANALYZING (AI Vision)
      setUploadState("ANALYZING");
      const visRes = await fetch("/api/media/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...basePayload, action: "vision" })
      });
      const visData = await visRes.json();
      newIntel.detectedContent = visData.detectedContent;
      if (newIntel.diagnostics) newIntel.diagnostics.vision = visData.diagnostics;

      // 3. CLASSIFYING (Tags)
      setUploadState("CLASSIFYING");
      const tagRes = await fetch("/api/media/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...basePayload, action: "tagging" })
      });
      const tagData = await tagRes.json();
      newIntel.tags = tagData.tags;
      if (newIntel.diagnostics) newIntel.diagnostics.tagging = tagData.diagnostics;

      // 4. MODERATING
      setUploadState("MODERATING");
      const modRes = await fetch("/api/media/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...basePayload, action: "moderation" })
      });
      const modData = await modRes.json();
      newIntel.moderation = modData.moderation;
      if (newIntel.diagnostics) newIntel.diagnostics.moderation = modData.diagnostics;

      // 5. METADATA (READY)
      const metaRes = await fetch("/api/media/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...basePayload, action: "metadata",
          visionSuccess: visData.success, taggingSuccess: tagData.success, moderationState: modData.moderation
        })
      });
      const metaData = await metaRes.json();
      newIntel.metadata = metaData.metadata;

      setIntelligence(newIntel);
      setUploadState("READY");
      
      // Auto-trigger security reasoning since user wanted it all in one flow, or keep it manual?
      // Wait, the user said "Update the existing security evidence UI... then continue through the OpenAI path"
      // I'll keep the "Analyze Evidence" button to trigger it manually, so the user can review Cloudinary tags first.
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process media pipeline");
      setUploadState("ERROR");
    }
  }

  async function handleRuleAnalysis() {
    setSubmitting(true);
    setUploadState("RULE_EVALUATION");
    setError(null);
    try {
      const payload = {
        evidence: evidence, // Send the full Cloudinary SecurityEvidence object
        cloudinaryIntelligence: intelligence,
        userContext: title
      };

      const res = await fetch("/api/security/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rule analysis failed");
      
      setSecurityResult(data.analysis);
      setUploadState("DONE");
      
      // If we got an ID back from Supabase, redirect to the evidence report
      if (data.analysisId) {
        router.push(`/dashboard/evidence/${data.analysisId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rule analysis failed");
      setUploadState("READY"); // Revert back so they can retry
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitText(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 3 || content.trim().length < 10) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), input_content: content.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      router.push(`/dashboard/analysis/${data.analysis.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  function renderEvidenceUI() {
    const isProcessing = ["UPLOADING", "ANALYZING", "CLASSIFYING", "MODERATING"].includes(uploadState);

    return (
      <div className="space-y-6">
        {uploadState === "EMPTY" || uploadState === "ERROR" ? (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-px bg-[--color-rule] border border-[--color-rule]">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault(); setDragging(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleMediaUpload(f);
                }}
                className="w-full flex flex-col items-center justify-center transition-all duration-200 cursor-pointer bg-[--color-surface] hover:bg-[--color-surface-2] group relative"
                style={{ minHeight: "480px", padding: "24px" }}
                onClick={() => fileRef.current?.click()}
              >
                {dragging && <div className="absolute inset-0 border-2 border-[--color-ink] bg-[--color-surface-2]/50 pointer-events-none" />}
                <div className="w-16 h-16 rounded-full bg-[--color-background] border border-[--color-rule-strong] flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <UploadCloud className="w-6 h-6 text-[--color-ink]" />
                </div>
                <p className="font-editorial text-2xl mb-4 text-[--color-ink]" style={{ letterSpacing: "0.05em" }}>
                  DROP SECURITY EVIDENCE
                </p>
                <p className="font-ui text-sm text-[--color-ink-3] mb-8">
                  or click to browse local files
                </p>
                <hr className="w-16 border-t border-[--color-rule-strong] mb-8" />
                <p className="font-technical text-xs tracking-widest uppercase text-[--color-ink-4]">
                  JPG &nbsp; PNG &nbsp; WEBP &nbsp; MP4
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMediaUpload(f); }}
                  accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm,application/pdf"
                />
              </div>

              <div className="bg-[--color-surface] p-8 flex flex-col">
                <p className="font-technical text-[10px] tracking-widest uppercase text-[--color-ink-4] mb-8">ANALYSIS SETTINGS</p>
                
                <div className="space-y-6">
                  <div>
                    <p className="font-ui text-sm text-[--color-ink-3] mb-1">Mode</p>
                    <p className="font-technical text-xs text-[--color-ink]">Automatic</p>
                  </div>
                  <div>
                    <p className="font-ui text-sm text-[--color-ink-3] mb-1">Provider</p>
                    <p className="font-technical text-xs text-[--color-ink]">Cloudinary</p>
                  </div>
                  <div>
                    <p className="font-ui text-sm text-[--color-ink-3] mb-1">Analysis Engine</p>
                    <p className="font-technical text-xs text-[--color-ink]">Rule Engine</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border border-[--color-rule] bg-[--color-surface] p-6">
              <p className="font-technical text-[10px] tracking-widest uppercase text-[--color-ink-4] mb-4">PIPELINE PREVIEW</p>
              <div className="flex flex-wrap items-center gap-2 font-technical text-[10px] tracking-widest uppercase text-[--color-ink-3]">
                <span>UPLOAD</span>
                <span className="text-[--color-ink-4]">→</span>
                <span>ANALYZE</span>
                <span className="text-[--color-ink-4]">→</span>
                <span>CLASSIFY</span>
                <span className="text-[--color-ink-4]">→</span>
                <span>MODERATE</span>
                <span className="text-[--color-ink-4]">→</span>
                <span>RULES</span>
                <span className="text-[--color-ink-4]">→</span>
                <span>REPORT</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ border: "1px solid var(--color-rule)", backgroundColor: "var(--color-surface)" }}>
            <div className="grid grid-cols-1 md:grid-cols-2">
              
              {/* Media Preview & Metadata */}
              <div className="border-b md:border-b-0 md:border-r border-[--color-rule] flex flex-col">
                <div className="p-6">
                  <p className="eyebrow mb-3">EVIDENCE</p>
                  <hr className="rule-strong mb-4" />
                  <p className="font-technical text-sm mb-4 truncate text-[--color-ink]" title={title}>
                    {title}
                  </p>
                  
                  <div className="space-y-4 mb-4">
                    <div>
                      <p className="font-technical text-[10px] text-[--color-ink-4] uppercase mb-0.5">TYPE</p>
                      <p className="font-technical text-xs uppercase text-[--color-ink]">{evidence?.resourceType}</p>
                    </div>
                    {evidence?.width && evidence?.height && (
                      <div>
                        <p className="font-technical text-[10px] text-[--color-ink-4] uppercase mb-0.5">DIMENSIONS</p>
                        <p className="font-technical text-xs text-[--color-ink]">{evidence.width} × {evidence.height}</p>
                      </div>
                    )}
                    {evidence?.bytes && (
                      <div>
                        <p className="font-technical text-[10px] text-[--color-ink-4] uppercase mb-0.5">SIZE</p>
                        <p className="font-technical text-xs text-[--color-ink]">{(evidence.bytes / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    )}
                    <div>
                      <p className="font-technical text-[10px] text-[--color-ink-4] uppercase mb-0.5">CLOUDINARY ID</p>
                      <p className="font-technical text-[10px] text-[--color-ink-3] break-all">{evidence?.publicId}</p>
                    </div>
                  </div>
                  <hr className="rule-strong mb-6" />
                </div>
                
                <div className="p-1 flex-1 flex flex-col">
                  {evidence?.resourceType === "image" ? (
                    <div className="bg-[--color-surface-2] flex items-center justify-center overflow-hidden flex-1" style={{ minHeight: "300px" }}>
                      <CldImage
                        src={evidence.publicId}
                        width={800} height={600}
                        crop="limit" format="auto" quality="auto"
                        alt="Security Evidence"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : evidence?.resourceType === "video" ? (
                    <div className="bg-[--color-surface-2] flex-1" style={{ minHeight: "300px" }}>
                      <CldVideoPlayer
                        id="evidence-player"
                        src={evidence.publicId}
                        width={800} height={600}
                        colors={{ base: "#111", accent: "#fff", text: "#fff" }}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center bg-[--color-surface-2] flex-1" style={{ minHeight: "300px" }}>
                      <p className="font-technical text-xs text-[--color-ink-3]">Preview not available.</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Pipeline Status & Intelligence */}
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <p className="eyebrow mb-4">CLOUDINARY PIPELINE</p>
                  <div className="space-y-3 mb-8">
                    {[
                      { state: "UPLOADING", label: "01 UPLOADED", desc: "Cloudinary asset created" },
                      { state: "ANALYZING", label: "02 ANALYZING", desc: "AI Vision processing" },
                      { state: "CLASSIFYING", label: "03 CLASSIFYING", desc: "Generating media intelligence" },
                      { state: "MODERATING", label: "04 MODERATING", desc: "Content evaluation" },
                      { state: "READY", label: "05 READY", desc: "Evidence ready for security analysis" },
                    ].map((step) => {
                      const states = ["EMPTY", "UPLOADING", "UPLOADED", "ANALYZING", "CLASSIFYING", "MODERATING", "READY", "RULE_EVALUATION", "DONE"];
                      const currentIdx = states.indexOf(uploadState as string);
                      const stepIdx = states.indexOf(step.state);
                      
                      let statusIcon;
                      let statusDesc = step.desc;

                      if (currentIdx > stepIdx || uploadState === "READY" || uploadState === "RULE_EVALUATION" || uploadState === "DONE") {
                        statusIcon = <CheckCircle2 className="w-4 h-4 text-[--color-low]" />;
                        // If diagnostic failed, we show Add-on required
                        if (step.state === "ANALYZING" && intelligence.diagnostics?.vision === "ADDON_REQUIRED") {
                          statusDesc = "Add-on Required";
                          statusIcon = <AlertTriangle className="w-4 h-4 text-[--color-medium]" />;
                        }
                        if (step.state === "CLASSIFYING" && intelligence.diagnostics?.tagging === "ADDON_REQUIRED") {
                          statusDesc = "Add-on Required";
                          statusIcon = <AlertTriangle className="w-4 h-4 text-[--color-medium]" />;
                        }
                        if (step.state === "MODERATING" && intelligence.diagnostics?.moderation === "ADDON_REQUIRED") {
                          statusDesc = "Add-on Required";
                          statusIcon = <AlertTriangle className="w-4 h-4 text-[--color-medium]" />;
                        }
                      } else if (currentIdx === stepIdx) {
                        statusIcon = <Loader2 className="w-4 h-4 animate-spin text-[--color-ink-2]" />;
                      } else {
                        statusIcon = <div className="w-4 h-4 rounded-full border border-[--color-rule-strong]" />;
                      }

                      return (
                        <div key={step.state} className="flex items-start gap-3">
                          <div className="mt-0.5">{statusIcon}</div>
                          <div>
                            <p className="font-technical text-xs font-bold text-[--color-ink]">{step.label}</p>
                            <p className="font-technical text-xs text-[--color-ink-3]">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {uploadState === "READY" && (
                    <div className="animate-in stagger-1">
                      <p className="eyebrow mb-2 mt-6 pt-4 border-t border-[--color-rule-light]">MEDIA INTELLIGENCE</p>
                      <hr className="rule-strong mb-4" />
                      
                      <p className="font-technical text-[10px] text-[--color-ink-4] uppercase mb-4 tracking-widest">OBSERVED SIGNALS</p>

                      <div className="mb-6">
                        <p className="font-technical text-xs text-[--color-ink-4] mb-2 uppercase">TAGS</p>
                        <div className="flex flex-wrap gap-2">
                          {intelligence.tags && intelligence.tags.length > 0 ? intelligence.tags.map(t => (
                            <div key={t} className="font-technical text-xs px-2 py-1 border border-[--color-rule] bg-[--color-surface-2] text-[--color-ink-2]">
                              {t}
                            </div>
                          )) : (
                            <div className="font-technical text-xs px-2 py-1 border border-[--color-rule] bg-[--color-surface-2] text-[--color-ink-3]">
                              None (or Add-on required)
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-6">
                        <p className="font-technical text-xs text-[--color-ink-4] mb-2 uppercase">CONTENT DETECTION</p>
                        <p className="font-technical text-xs text-[--color-ink] leading-relaxed">
                          {intelligence.detectedContent || "No machine-readable objects detected."}
                        </p>
                      </div>

                      <div>
                        <p className="font-technical text-xs text-[--color-ink-4] mb-2 uppercase">MODERATION</p>
                        <div className="grid grid-cols-[100px_1fr] gap-y-1">
                          <p className="font-technical text-xs text-[--color-ink-4]">STATUS</p>
                          <p className="font-technical text-xs text-[--color-ink] uppercase">{intelligence.moderation || "PENDING"}</p>
                          
                          <p className="font-technical text-xs text-[--color-ink-4]">PROVIDER</p>
                          <p className="font-technical text-xs text-[--color-ink] uppercase">CLOUDINARY</p>
                          
                          <p className="font-technical text-xs text-[--color-ink-4]">ASSET ID</p>
                          <p className="font-technical text-xs text-[--color-ink] truncate">{evidence?.assetId}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(uploadState === "RULE_EVALUATION" || uploadState === "DONE") && (
                    <div className="animate-in stagger-2 mt-8">
                      <p className="eyebrow mb-3 pt-4 border-t border-[--color-rule-light]">SECURITY ANALYSIS</p>
                      {uploadState === "RULE_EVALUATION" ? (
                        <div className="flex items-center gap-2 text-[--color-ink-3]">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="font-technical text-xs">Evaluating Rules...</span>
                        </div>
                      ) : securityResult && (
                        <div className="space-y-6">
                          <div>
                            <p className="font-technical text-xs text-[--color-ink-4] mb-1">RISK ASSESSMENT</p>
                            <div className="flex gap-4">
                              <span className="font-editorial text-2xl font-bold" style={{ color: securityResult.risk_score !== null && securityResult.risk_score > 70 ? "var(--color-critical)" : securityResult.risk_score !== null && securityResult.risk_score > 40 ? "var(--color-medium)" : "var(--color-low)"}}>
                                {securityResult.risk_score !== null ? `${securityResult.risk_score} / 100` : "N/A"}
                              </span>
                              <span className="font-technical text-xs uppercase px-2 py-1 border border-[--color-rule] self-start" style={{ color: "var(--color-ink)", backgroundColor: "var(--color-surface-2)" }}>
                                {securityResult.overall_severity}
                              </span>
                            </div>
                          </div>

                          <div>
                            <p className="font-technical text-xs text-[--color-ink-4] mb-2">OBSERVED EVIDENCE (FACTS)</p>
                            <ul className="space-y-2">
                              {securityResult.observations.map(obs => (
                                <li key={obs.id} className="font-editorial text-sm leading-relaxed text-[--color-ink] border-l-2 border-[--color-rule] pl-3">
                                  {obs.statement} <span className="font-technical text-[10px] text-[--color-ink-4] ml-2">({obs.evidence_source})</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <p className="font-technical text-xs text-[--color-ink-4] mb-2">POTENTIAL RISKS (INFERRED)</p>
                            <ul className="space-y-4">
                              {securityResult.potential_risks.map(risk => (
                                <li key={risk.id} className="p-4 border border-[--color-rule] bg-[--color-surface-2]">
                                  <div className="flex justify-between items-start mb-2">
                                    <p className="font-ui text-sm font-semibold">{risk.title}</p>
                                    <span className="font-technical text-[10px] uppercase text-[--color-ink-3]">{risk.severity}</span>
                                  </div>
                                  <p className="font-editorial text-sm text-[--color-ink-2] mb-3">{risk.statement}</p>
                                  <p className="font-technical text-[10px] text-[--color-ink-4]">CONFIDENCE: {risk.confidence}%</p>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <p className="font-technical text-xs text-[--color-ink-4] mb-2">RECOMMENDED ACTIONS</p>
                            <ul className="space-y-2">
                              {securityResult.recommendations.map((rec, i) => (
                                <li key={i} className="font-editorial text-sm leading-relaxed text-[--color-ink] flex gap-2">
                                  <span className="text-[--color-ink-4]">—</span>
                                  <span>{rec.action} <span className="text-[--color-ink-3]">({rec.rationale})</span></span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-[--color-rule-light] pt-4">
                  <Button variant="ghost" size="sm" type="button" onClick={() => { setUploadState("EMPTY"); setEvidence(null); setIntelligence({}); setSecurityResult(null); }} disabled={isProcessing}>
                    Reset
                  </Button>
                  <Button variant="primary" size="md" type="button" onClick={handleRuleAnalysis} disabled={isProcessing || !title || (uploadState !== "READY") || submitting}>
                    {submitting ? "Analyzing..." : "Analyze Evidence"}
                  </Button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    );
  }

  function renderTextUI() {
    return (
      <div className="space-y-4">
        <div style={{ border: "1px solid var(--color-rule)" }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your security input here..."
            className="w-full bg-[--color-surface] text-[--color-ink]"
            style={{
              minHeight: "340px", padding: "16px", fontFamily: "var(--font-mono)",
              fontSize: "0.8125rem", lineHeight: "1.7", resize: "vertical", outline: "none",
            }}
            maxLength={MAX_TEXT}
            disabled={submitting}
            spellCheck={false}
          />
          <div className="flex items-center justify-between p-3 border-t border-[--color-rule-light]">
            <div className="flex gap-2">
              <span className="font-ui text-xs text-[--color-ink-4]">Try:</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => { setContent(ex.content); if(!title) setTitle(`Demo: ${ex.label}`); }}
                  className="font-technical text-xs px-2 py-0.5 border border-[--color-rule] text-[--color-ink-3] hover:bg-[--color-surface-2]"
                >
                  {ex.label}
                </button>
              ))}
            </div>
            <span className="font-technical text-xs tabular-nums text-[--color-ink-4]">
              {content.length.toLocaleString()} / {MAX_TEXT.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button type="button" onClick={handleSubmitText} variant="primary" size="md" disabled={submitting || !title || content.length < 10}>
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : "Analyze Text"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex mb-8" style={{ borderBottom: "1px solid var(--color-rule)" }}>
        <button
          onClick={() => setMode("evidence")}
          className="flex items-center gap-2 px-6 py-3 font-ui text-xs font-semibold tracking-wider uppercase transition-colors"
          style={{
            color: mode === "evidence" ? "var(--color-ink)" : "var(--color-ink-4)",
            borderBottom: mode === "evidence" ? "2px solid var(--color-ink)" : "2px solid transparent",
            marginBottom: "-1px"
          }}
        >
          <ImageIcon className="w-4 h-4" />
          Security Evidence
        </button>
        <button
          onClick={() => setMode("text")}
          className="flex items-center gap-2 px-6 py-3 font-ui text-xs font-semibold tracking-wider uppercase transition-colors"
          style={{
            color: mode === "text" ? "var(--color-ink)" : "var(--color-ink-4)",
            borderBottom: mode === "text" ? "2px solid var(--color-ink)" : "2px solid transparent",
            marginBottom: "-1px"
          }}
        >
          <FileSearch className="w-4 h-4" />
          Text Analysis
        </button>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div>
          <label htmlFor="analysis-title" className="block font-ui text-xs font-semibold tracking-wider uppercase mb-2 text-[--color-ink-3]">
            Analysis Name
          </label>
          <Input
            id="analysis-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={mode === "evidence" ? "e.g. Dashboard Screenshot, Architecture Diagram" : "e.g. S3 Config Audit"}
            disabled={submitting || (mode === "evidence" && !["EMPTY", "READY", "ERROR"].includes(uploadState))}
            className="w-full bg-[--color-surface] border border-[--color-rule] px-4 py-3 font-technical text-sm text-[--color-ink] placeholder:text-[--color-ink-4] focus:outline-none focus:border-[--color-ink] transition-colors rounded-none"
          />
        </div>

        {mode === "evidence" ? renderEvidenceUI() : renderTextUI()}

        {error && (
          <div className="py-3 px-4 flex items-center gap-2 text-sm bg-[--color-critical-bg] border border-[--color-critical-rule] text-[--color-critical]">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
