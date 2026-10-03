"use client";

import React, { useEffect, useState } from "react";
import { useAnalysis } from "./AnalysisContext";
import {
  Upload,
  Search,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Brain,
  Loader2,
  PlayCircle,
  Shield,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  RefreshCw,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CldImage } from "next-cloudinary";

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceStatus =
  | "Operational"
  | "Degraded"
  | "Offline"
  | "Configuration Error"
  | "Missing Key"
  | "Authentication Failed"
  | "loading";

interface HealthData {
  secureflow: { status: ServiceStatus; latency: number };
  cloudinary: { status: ServiceStatus; latency: number; detail?: string };
  supabase: { status: ServiceStatus; latency: number; detail?: string };
  supabase_admin: { status: ServiceStatus; latency: number; detail?: string };
  openai: { status: ServiceStatus; latency: number; detail?: string };
  timestamp: string;
}

// ─── Service Status Indicator ────────────────────────────────────────────────

function StatusDot({ status }: { status: ServiceStatus }) {
  if (status === "loading") {
    return <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />;
  }
  if (status === "Operational") {
    return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
  }
  if (status === "Degraded") {
    return <AlertTriangle className="w-3 h-3 text-amber-500" />;
  }
  if (status === "Configuration Error" || status === "Missing Key") {
    return <XCircle className="w-3 h-3 text-red-500" />;
  }
  if (status === "Authentication Failed") {
    return <XCircle className="w-3 h-3 text-red-500" />;
  }
  // Offline
  return <XCircle className="w-3 h-3 text-slate-400" />;
}

function statusText(status: ServiceStatus): string {
  if (status === "loading") return "Checking…";
  return status;
}

function statusColor(status: ServiceStatus): string {
  if (status === "Operational") return "text-emerald-700";
  if (status === "Degraded") return "text-amber-700";
  if (
    status === "Configuration Error" ||
    status === "Missing Key" ||
    status === "Authentication Failed"
  )
    return "text-red-700";
  return "text-slate-500";
}

// ─── Hook: Real health data ───────────────────────────────────────────────────

function useHealthCheck() {
  const loadingState: HealthData = {
    secureflow: { status: "loading", latency: 0 },
    cloudinary: { status: "loading", latency: 0 },
    supabase: { status: "loading", latency: 0 },
    supabase_admin: { status: "loading", latency: 0 },
    openai: { status: "loading", latency: 0 },
    timestamp: "",
  };
  const [health, setHealth] = useState<HealthData>(loadingState);
  const [fetching, setFetching] = useState(false);

  async function refresh() {
    setFetching(true);
    setHealth(loadingState);
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const data = await res.json();
      setHealth(data as HealthData);
    } catch {
      setHealth({
        secureflow: { status: "Offline", latency: 0 },
        cloudinary: { status: "Offline", latency: 0 },
        supabase: { status: "Offline", latency: 0 },
        supabase_admin: { status: "Offline", latency: 0 },
        openai: { status: "Offline", latency: 0 },
        timestamp: new Date().toISOString(),
      });
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { health, fetching, refresh };
}

// ─── Backend Readiness Panel ──────────────────────────────────────────────────
// Shows REAL backend status driven by /api/health — no hardcoded checkmarks.

function BackendReadinessPanel() {
  const { health, fetching, refresh } = useHealthCheck();

  const rows: { label: string; key: keyof Omit<HealthData, "timestamp"> }[] = [
    { label: "Cloudinary ingestion", key: "cloudinary" },
    { label: "AI engine (OpenAI)", key: "openai" },
    { label: "Database (write access)", key: "supabase_admin" },
  ];

  const hasConfigError = rows.some(
    (r) =>
      health[r.key].status === "Configuration Error" ||
      health[r.key].status === "Missing Key" ||
      health[r.key].status === "Authentication Failed"
  );

  return (
    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Backend Readiness
        </p>
        <button
          onClick={refresh}
          disabled={fetching}
          title="Refresh service health"
          className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${fetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-2.5">
        {rows.map(({ label, key }) => {
          const svc = health[key];
          const detail = (svc as { detail?: string }).detail;
          return (
            <div key={key}>
              <div className="flex items-center gap-2">
                <StatusDot status={svc.status} />
                <span className="text-xs font-semibold text-slate-700 flex-1">
                  {label}
                </span>
                <span
                  className={`text-[10px] font-bold ${statusColor(svc.status)}`}
                >
                  {statusText(svc.status)}
                </span>
              </div>
              {/* Show detail only for non-operational states */}
              {detail &&
                svc.status !== "Operational" &&
                svc.status !== "loading" && (
                  <div className="ml-5 mt-1 flex items-start gap-1.5">
                    <Info className="w-2.5 h-2.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 leading-snug">
                      {detail}
                    </p>
                  </div>
                )}
            </div>
          );
        })}
      </div>

      {hasConfigError && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <p className="text-[10px] font-bold text-amber-800 mb-1">
            Configuration action required
          </p>
          <p className="text-[10px] text-amber-700 leading-relaxed">
            One or more services have configuration errors. Add the missing
            credentials to{" "}
            <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code>{" "}
            and restart the dev server.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Pipeline Error Details ───────────────────────────────────────────────────

function PipelineErrorBanner({
  error,
  pipelineError,
  onRetry,
  submitting,
}: {
  error: string | null;
  pipelineError: { stage: string; code: string; message: string; retryable: boolean; uploadSucceeded?: boolean; evidenceId?: string | null } | null;
  onRetry: () => void;
  submitting: boolean;
}) {
  if (!error) return null;

  const isRateLimited =
    pipelineError?.code === "OPENAI_RATE_LIMITED" ||
    pipelineError?.code === "OPENAI_AUTH_ERROR";

  const isConfigError =
    pipelineError?.code === "SUPABASE_SERVICE_ROLE_KEY_MISSING" ||
    pipelineError?.code === "SUPABASE_URL_MISSING" ||
    pipelineError?.code === "AI_AUTH_ERROR" ||
    isRateLimited;

  // Distinct banner for OpenAI unavailability — upload succeeded
  if (isRateLimited) {
    return (
      <div className="rounded-xl p-4 mb-5 border bg-amber-50 border-amber-200">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold mb-1 text-amber-800">
              Security AI Unavailable
              <span className="ml-2 font-mono text-[9px] opacity-60">[{pipelineError?.code}]</span>
            </p>
            <div className="space-y-2">
              <p className="text-xs leading-relaxed text-amber-700">{error}</p>
              {pipelineError?.uploadSucceeded && (
                <div className="mt-2 text-[11px] text-amber-600 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    <span className="text-green-700 font-semibold">Cloudinary upload succeeded</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <XCircle className="w-3 h-3 text-amber-600" />
                    <span>Security AI analysis — unavailable (no credits)</span>
                  </div>
                </div>
              )}
              <p className="text-[11px] text-amber-600 mt-2">
                Add OpenAI credits at{" "}
                <a href="https://platform.openai.com/settings/organization/billing" target="_blank" rel="noopener noreferrer" className="underline font-semibold">platform.openai.com</a>
                {" "}to enable full security analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl p-4 mb-5 border ${
        isConfigError
          ? "bg-amber-50 border-amber-100"
          : "bg-red-50 border-red-100"
      }`}
    >
      <div className="flex items-start gap-2.5">
        {isConfigError ? (
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        ) : (
          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <p
            className={`text-xs font-bold mb-1 ${
              isConfigError ? "text-amber-800" : "text-red-800"
            }`}
          >
            {isConfigError ? "Configuration Required" : "Analysis Failed"}
            {pipelineError && (
              <span className="ml-2 font-mono text-[9px] opacity-60">
                [{pipelineError.code}]
              </span>
            )}
          </p>
          <p
            className={`text-xs leading-relaxed ${
              isConfigError ? "text-amber-700" : "text-red-600"
            }`}
          >
            {error}
          </p>
        </div>
      </div>
      {pipelineError?.retryable && !isConfigError && (
        <button
          onClick={onRetry}
          disabled={submitting}
          className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-red-700 hover:text-red-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-3 h-3" />
          Retry Analysis
        </button>
      )}
    </div>
  );
}

// ─── 1. COMMAND BAR ──────────────────────────────────────────────────────────

export function AnalysisCommandBar() {
  return (
    <div className="w-full h-14 bg-white/50 backdrop-blur-xl border-b border-[rgba(15,23,42,0.06)] px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs font-bold text-slate-800 tracking-wide">
          SECUREFLOW AI
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/50 border border-slate-200/50 rounded-lg text-[11px] font-medium text-slate-500">
          <Search className="w-3.5 h-3.5" />
          <span className="opacity-60">Search</span>
          <kbd className="ml-2 font-mono text-[9px] bg-white px-1 py-0.5 rounded border border-slate-200 shadow-sm">
            ⌘K
          </kbd>
        </div>
        <div className="w-7 h-7 rounded-full bg-slate-200 border border-white shadow-sm" />
      </div>
    </div>
  );
}

// ─── 2. HERO ─────────────────────────────────────────────────────────────────

export function AnalysisHero() {
  const { mode, setMode } = useAnalysis();

  return (
    <div className="w-full max-w-4xl mx-auto pt-16 pb-12 flex flex-col items-center text-center">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-6"
      >
        New Security Analysis
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="text-4xl md:text-5xl font-editorial font-medium text-slate-900 mb-4 tracking-tight"
      >
        Analyze evidence
        <br />
        with intelligence.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-slate-500 text-sm md:text-base max-w-xl leading-relaxed mb-10"
      >
        Upload security evidence and let SecureFlow automatically identify,
        classify, analyze and report potential security risks.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex p-1 bg-slate-100/80 rounded-xl border border-[rgba(15,23,42,0.04)] shadow-sm"
      >
        <button
          onClick={() => setMode("evidence")}
          className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            mode === "evidence"
              ? "bg-white text-slate-900 shadow-[0_2px_10px_rgb(0,0,0,0.04)]"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Security Evidence
        </button>
        <button
          onClick={() => setMode("text")}
          className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            mode === "text"
              ? "bg-white text-slate-900 shadow-[0_2px_10px_rgb(0,0,0,0.04)]"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          <FileText className="w-4 h-4" /> Text Analysis
        </button>
      </motion.div>
    </div>
  );
}

// ─── 3. EVIDENCE DROPZONE ────────────────────────────────────────────────────

export function EvidenceDropzone() {
  const {
    uploadState,
    dragging,
    setDragging,
    handleMediaUpload,
    fileRef,
    evidence,
    title,
    handleSecurityReasoning,
    submitting,
    error,
    pipelineError,
    resetAll,
  } = useAnalysis();

  // "Ready" state: asset is uploaded and Cloudinary analysis is complete (or AI failed)
  if (uploadState === "DONE" || uploadState === "REASONING" || uploadState === "READY" || uploadState === "AI_UNAVAILABLE") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl mx-auto bg-white rounded-3xl p-8 border border-[rgba(15,23,42,0.08)] shadow-[0_8px_30px_rgb(15,23,42,0.04)] flex flex-col md:flex-row gap-8 items-start mb-12"
      >
        {/* Evidence preview */}
        <div className="w-full md:w-1/2 aspect-video bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden flex items-center justify-center p-4 flex-shrink-0">
          {evidence ? (
            <CldImage
              src={evidence.publicId}
              alt="Evidence"
              fill
              className="object-contain drop-shadow-md"
            />
          ) : (
            <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="w-full md:w-1/2 flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-1">
            Evidence ready
          </h3>
          <p className="text-sm text-slate-500 mb-6 truncate">{title}</p>

          {/* Real backend readiness panel */}
          <BackendReadinessPanel />

          {/* Error banner with retry support */}
          <PipelineErrorBanner
            error={error}
            pipelineError={pipelineError}
            onRetry={handleSecurityReasoning}
            submitting={submitting}
          />

          {/* Start analysis button */}
          <button
            onClick={handleSecurityReasoning}
            disabled={submitting}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <PlayCircle className="w-4 h-4" />
            )}
            {submitting ? "Analyzing…" : "Start Security Analysis"}
          </button>

          {/* Start over link */}
          <button
            onClick={resetAll}
            className="mt-3 text-center text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
          >
            Upload different evidence
          </button>
        </div>
      </motion.div>
    );
  }

  const isUploading = [
    "UPLOADING",
    "ANALYZING",
    "CLASSIFYING",
    "MODERATING",
  ].includes(uploadState);

  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      <input
        type="file"
        ref={fileRef}
        className="hidden"
        accept="image/*,video/*,application/pdf"
        onChange={(e) =>
          e.target.files?.[0] && handleMediaUpload(e.target.files[0])
        }
      />

      <motion.div
        layout
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragging(false);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f && !isUploading) handleMediaUpload(f);
        }}
        className={`w-full aspect-[21/9] rounded-[24px] border border-[rgba(15,23,42,0.06)] shadow-[0_8px_40px_rgb(15,23,42,0.03)] bg-white relative overflow-hidden transition-all duration-300 group ${
          dragging
            ? "ring-4 ring-blue-500/20 border-blue-500/50"
            : "hover:border-[rgba(15,23,42,0.12)]"
        }`}
      >
        {/* Soft background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(37,99,235,0.04),transparent_45%)]" />

        {/* Upload error banner */}
        {error && uploadState === "ERROR" && (
          <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-100 rounded-xl p-4 z-20">
            <p className="text-xs font-bold text-red-800 mb-1">Upload Failed</p>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          {!isUploading ? (
            <>
              <motion.div
                animate={{ scale: dragging ? 1.1 : 1, y: dragging ? -10 : 0 }}
                className="relative w-16 h-16 flex items-center justify-center mb-6"
              >
                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
                <Brain
                  className={`w-8 h-8 transition-colors ${
                    dragging
                      ? "text-blue-600"
                      : "text-slate-300 group-hover:text-blue-500"
                  }`}
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-ping" />
              </motion.div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 transition-colors">
                {dragging ? "Release to analyze" : "Drop evidence here"}
              </h3>
              <p className="text-sm text-slate-500 mb-8">
                Drag &amp; drop or{" "}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="text-blue-600 font-semibold pointer-events-auto hover:underline"
                >
                  browse files
                </button>
              </p>
              <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                <span>JPG</span>
                <span>PNG</span>
                <span>WEBP</span>
                <span>MP4</span>
                <span>PDF</span>
              </div>
              <div className="absolute bottom-6 flex w-full px-8 justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Max 10 MB</span>
                <span>
                  Local Upload{" "}
                  <kbd className="ml-1 bg-slate-100 px-1 py-0.5 rounded border">
                    ⌘U
                  </kbd>
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center w-full max-w-sm px-6">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-6" />
              <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-widest">
                {uploadState === "UPLOADING"
                  ? "Uploading Evidence"
                  : uploadState === "ANALYZING"
                  ? "Cloudinary Vision Analysis"
                  : uploadState === "CLASSIFYING"
                  ? "AI Tagging"
                  : "Moderation Check"}
              </h3>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-blue-500 rounded-full"
                  initial={{ width: "10%" }}
                  animate={{
                    width:
                      uploadState === "UPLOADING"
                        ? "30%"
                        : uploadState === "ANALYZING"
                        ? "60%"
                        : uploadState === "CLASSIFYING"
                        ? "80%"
                        : "95%",
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Cloudinary → AI → Rules
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── 4. BENTO GRID ───────────────────────────────────────────────────────────

export function PipelineBento() {
  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* Card 1: AI Analysis Engine (Spans 2 cols) */}
      <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-[rgba(15,23,42,0.08)] shadow-[0_8px_30px_rgb(15,23,42,0.03)] relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_100%_0%,rgba(124,58,237,0.04),transparent_50%)] pointer-events-none" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
          AI Analysis Engine
        </p>
        <h3 className="text-xl font-bold text-slate-800 mb-8">
          Automatic detection
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-sm font-semibold text-slate-700">
              Classification &amp; Tagging
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            <span className="text-sm font-semibold text-slate-700">
              Content Moderation
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-slate-700">
              Security Reasoning
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Cloudinary */}
      <div className="bg-white rounded-3xl p-8 border border-[rgba(15,23,42,0.08)] shadow-[0_8px_30px_rgb(15,23,42,0.03)] flex flex-col hover:-translate-y-0.5 transition-transform duration-300">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
          Cloudinary
        </p>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-bold text-emerald-700">Connected</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed mt-auto">
          Media intelligence and optimization pipeline.
        </p>
      </div>

      {/* Card 3: Security Pipeline */}
      <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-[rgba(15,23,42,0.08)] shadow-[0_8px_30px_rgb(15,23,42,0.03)] hover:-translate-y-0.5 transition-transform duration-300">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
          Security Pipeline
        </p>
        <div className="flex items-center justify-between mt-4 relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100 -z-10" />
          {["Upload", "Analyze", "Classify", "Reason", "Report"].map((step) => (
            <div key={step} className="flex flex-col items-center gap-3 bg-white px-2">
              <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-white" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Card 4: Formats */}
      <div className="bg-white rounded-3xl p-8 border border-[rgba(15,23,42,0.08)] shadow-[0_8px_30px_rgb(15,23,42,0.03)] hover:-translate-y-0.5 transition-transform duration-300 flex flex-col">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
          Supported Formats
        </p>
        <div className="flex flex-wrap gap-2 mt-auto">
          {["JPG", "PNG", "WEBP", "MP4", "PDF"].map((f) => (
            <span
              key={f}
              className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-md text-[10px] font-bold text-slate-500 shadow-sm transition-transform hover:-translate-y-0.5"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 5. WHAT HAPPENS NEXT ────────────────────────────────────────────────────

export function WhatHappensNext() {
  const steps = [
    {
      num: "01",
      title: "Secure upload",
      desc: "Your evidence is processed through the media pipeline.",
    },
    {
      num: "02",
      title: "AI inspection",
      desc: "Content is analyzed and classified.",
    },
    {
      num: "03",
      title: "Security reasoning",
      desc: "Findings are evaluated against security rules.",
    },
    {
      num: "04",
      title: "Report generation",
      desc: "Results are organized into actionable findings.",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-16">
      <h3 className="text-xl font-editorial font-bold text-slate-900 mb-8">
        What happens after upload?
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {steps.map((s) => (
          <div key={s.num} className="flex gap-4 group">
            <span className="text-sm font-mono text-slate-300 font-bold group-hover:text-blue-500 transition-colors">
              {s.num}
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                {s.title}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 6. TEXT ANALYSIS (ALTERNATIVE MODE) ─────────────────────────────────────

export function TextAnalysisDropzone() {
  const { title, setTitle, content, setContent, handleSubmitText, submitting } =
    useAnalysis();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto bg-white rounded-[24px] p-8 border border-[rgba(15,23,42,0.06)] shadow-[0_8px_40px_rgb(15,23,42,0.03)] mb-12"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Evidence Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Suspicious Dockerfile"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Raw Text Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste logs, configuration files, or code snippets here..."
            className="w-full h-64 bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-mono text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
          />
        </div>
        <button
          onClick={handleSubmitText}
          disabled={submitting || !title.trim() || !content.trim()}
          className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Shield className="w-4 h-4" />
          )}
          {submitting ? "Analyzing…" : "Analyze Text Content"}
        </button>
      </div>
    </motion.div>
  );
}

// ─── 7. MAIN EXPORT COMPONENT ────────────────────────────────────────────────

export function AnalysisStudioLayout() {
  const { mode } = useAnalysis();

  return (
    <div className="min-h-screen bg-[#F8F9FB] relative overflow-hidden font-sans">
      {/* Subtle Background Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.045),transparent_30%),radial-gradient(circle_at_20%_40%,rgba(37,99,235,0.035),transparent_35%)] pointer-events-none" />

      <AnalysisCommandBar />

      <main className="relative z-10 px-6 pb-24">
        <AnalysisHero />

        <AnimatePresence mode="wait">
          {mode === "evidence" ? (
            <motion.div
              key="evidence"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EvidenceDropzone />
              <PipelineBento />
              <WhatHappensNext />
            </motion.div>
          ) : (
            <motion.div
              key="text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TextAnalysisDropzone />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
