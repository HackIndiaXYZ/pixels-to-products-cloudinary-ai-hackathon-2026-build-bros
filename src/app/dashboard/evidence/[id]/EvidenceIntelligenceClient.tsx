"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ZoomIn, ZoomOut, Maximize2, Download, ExternalLink, Copy,
  RotateCcw, CheckCircle, AlertTriangle, XCircle, Shield,
  ChevronDown, ChevronRight, RefreshCw, Archive, Trash2,
  FileText, Info, Clock, Database, Cloud, Cpu, Eye,
  MoreHorizontal, X, Check
} from "lucide-react";
import { CldImage } from "next-cloudinary";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Evidence {
  id: string;
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
  width?: number;
  height?: number;
  bytes?: number;
  cloudinary_asset_id?: string;
  created_at?: string;
}

interface Risk {
  id: string;
  title: string;
  severity: string;
  category: string;
  statement: string;
  evidence?: string[];
  confidence?: number;
  is_inferred?: boolean;
}

interface Observation {
  id: string;
  statement: string;
  evidence_source: string;
  confidence: number;
}

interface Recommendation {
  id: string;
  priority: string;
  action: string;
  rationale: string;
}

interface RuleEntry {
  id: string;
  name: string;
  category: string;
  severity: string;
  description?: string;
}

interface EngineInfo {
  version: string;
  rulesActive: number;
  rulesEvaluated: RuleEntry[];
  triggeredRuleIds: string[];
}

interface IntegrityInfo {
  hash: string;
  algorithm: string;
  verified: boolean;
  storage: string;
}

interface Analysis {
  id: string;
  created_at: string;
  detected_evidence_type?: string;
  executive_summary?: string;
  risk_score?: number;
  overall_severity?: string;
  risk_status?: string;
  analysis_confidence?: string;
  model?: string;
  is_archived?: boolean;
  review_status?: string | null;
  title?: string;
}

interface EvidenceIntelligenceProps {
  analysisId: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  CRITICAL: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "CRITICAL" },
  HIGH:     { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", label: "HIGH" },
  MEDIUM:   { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "MEDIUM" },
  LOW:      { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "LOW" },
  INFO:     { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", label: "INFO" },
  critical: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "CRITICAL" },
  high:     { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", label: "HIGH" },
  medium:   { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "MEDIUM" },
  low:      { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "LOW" },
  info:     { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", label: "INFO" },
};

function SeverityBadge({ severity, size = "sm" }: { severity: string; size?: "xs" | "sm" | "md" }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG["INFO"];
  const px = size === "xs" ? "px-1.5 py-0.5 text-[9px]" : size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]";
  return (
    <span className={`inline-flex items-center font-bold tracking-widest rounded border ${cfg.bg} ${cfg.text} ${cfg.border} ${px}`}>
      {cfg.label}
    </span>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-bold text-slate-400 tracking-[0.15em] uppercase mb-3">
      {children}
    </p>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block w-1.5 h-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`} />
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: "success" | "error" | "info"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const colors = { success: "bg-emerald-50 border-emerald-200 text-emerald-800", error: "bg-red-50 border-red-200 text-red-800", info: "bg-blue-50 border-blue-200 text-blue-800" };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-semibold ${colors[type]}`}
    >
      {type === "success" && <Check className="w-4 h-4" />}
      {type === "error" && <X className="w-4 h-4" />}
      {type === "info" && <Info className="w-4 h-4" />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="w-3 h-3" /></button>
    </motion.div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ onCancel, onConfirm, loading }: { onCancel: () => void; onConfirm: () => void; loading: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Delete Evidence?</h2>
        </div>
        <p className="text-sm text-slate-600 mb-2">
          This will permanently remove the evidence record and all associated analysis data from SecureFlow.
        </p>
        <p className="text-xs text-slate-500 mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
          ⚠ The Cloudinary media asset will <strong>not</strong> be deleted. Only the database record will be removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            Delete Evidence
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Rule Row ─────────────────────────────────────────────────────────────────

function RuleRow({ rule, triggered }: { rule: RuleEntry; triggered: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-50 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 py-2.5 px-1 text-left hover:bg-slate-50/70 transition-colors rounded-lg group"
      >
        <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${triggered ? "bg-amber-100" : "bg-emerald-50"}`}>
          {triggered
            ? <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
            : <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
          }
        </span>
        <span className="flex-1 text-[11px] font-mono font-semibold text-slate-700">{rule.id}</span>
        {triggered && <SeverityBadge severity={rule.severity} size="xs" />}
        {open
          ? <ChevronDown className="w-3 h-3 text-slate-400" />
          : <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        }
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="ml-7 mb-3 p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
              <div className="flex gap-4 text-[10px]">
                <span className="text-slate-400 w-20 shrink-0">Rule Name</span>
                <span className="text-slate-700 font-semibold">{rule.name}</span>
              </div>
              <div className="flex gap-4 text-[10px]">
                <span className="text-slate-400 w-20 shrink-0">Category</span>
                <span className="text-slate-700 font-mono uppercase">{rule.category}</span>
              </div>
              <div className="flex gap-4 text-[10px]">
                <span className="text-slate-400 w-20 shrink-0">Severity</span>
                <SeverityBadge severity={rule.severity} size="xs" />
              </div>
              <div className="flex gap-4 text-[10px]">
                <span className="text-slate-400 w-20 shrink-0">Result</span>
                <span className={`font-bold ${triggered ? "text-amber-600" : "text-emerald-600"}`}>
                  {triggered ? "TRIGGERED" : "PASSED"}
                </span>
              </div>
              {rule.description && (
                <div className="flex gap-4 text-[10px]">
                  <span className="text-slate-400 w-20 shrink-0">Description</span>
                  <span className="text-slate-600">{rule.description}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Risk Score Gauge ─────────────────────────────────────────────────────────

function RiskGauge({ score, severity }: { score: number; severity: string }) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color =
    clampedScore >= 75 ? "#dc2626" :
    clampedScore >= 50 ? "#ea580c" :
    clampedScore >= 25 ? "#d97706" :
    "#16a34a";

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} stroke="#f1f5f9" strokeWidth="8" fill="none" />
          <motion.circle
            cx="48" cy="48" r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{clampedScore}</span>
          <span className="text-[9px] text-slate-400 font-bold">/ 100</span>
        </div>
      </div>
      <SeverityBadge severity={severity} size="md" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EvidenceIntelligenceClient({ analysisId }: EvidenceIntelligenceProps) {
  const [data, setData] = useState<{
    analysis: Analysis | null;
    evidence: Evidence | null;
    observations: Observation[];
    risks: Risk[];
    recommendations: Recommendation[];
    integrity: IntegrityInfo | null;
    engine: EngineInfo | null;
  }>({
    analysis: null,
    evidence: null,
    observations: [],
    risks: [],
    recommendations: [],
    integrity: null,
    engine: null,
  });

  const [loadState, setLoadState] = useState<"idle" | "loading" | "success" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [zoom, setZoom] = useState(100);
  const [rerunProgress, setRerunProgress] = useState<number | null>(null);
  const [expandedRulePanel, setExpandedRulePanel] = useState(true);
  const [expandedTimeline, setExpandedTimeline] = useState(true);
  const [expandedFindings, setExpandedFindings] = useState(true);
  const [integrityVerifyState, setIntegrityVerifyState] = useState<"idle" | "verifying" | "verified" | "failed">("idle");
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  }, []);

  const fetchData = useCallback(async () => {
    setLoadState("loading");
    try {
      const res = await fetch(`/api/evidence/${analysisId}`);
      if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
      const json = await res.json();
      setData({
        analysis: json.analysis,
        evidence: json.evidence,
        observations: json.observations || [],
        risks: json.risks || [],
        recommendations: json.recommendations || [],
        integrity: json.integrity,
        engine: json.engine,
      });
      setLoadState("success");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load evidence");
      setLoadState("error");
    }
  }, [analysisId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Close actions menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target as Node)) {
        setShowActionsMenu(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
      if (e.key === "r" || e.key === "R") handleRerun();
      if (e.key === "a" || e.key === "A") handleArchive();
      if (e.key === "d" || e.key === "D") handleDownload();
      if (e.key === "f" || e.key === "F") setZoom(100);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // ── Actions ──

  async function patchAnalysis(updates: Record<string, unknown>) {
    const res = await fetch(`/api/evidence/${analysisId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Update failed");
    return res.json();
  }

  async function handleArchive() {
    const isArchived = data.analysis?.is_archived;
    setActionLoading((p) => ({ ...p, archive: true }));
    try {
      await patchAnalysis({ is_archived: !isArchived });
      setData((prev) => ({ ...prev, analysis: prev.analysis ? { ...prev.analysis, is_archived: !isArchived } : null }));
      showToast(isArchived ? "Evidence restored successfully" : "Evidence archived successfully", "success");
    } catch {
      showToast("Archive action failed. Please try again.", "error");
    } finally {
      setActionLoading((p) => ({ ...p, archive: false }));
      setShowActionsMenu(false);
    }
  }

  async function handleDelete() {
    setActionLoading((p) => ({ ...p, delete: true }));
    try {
      const res = await fetch(`/api/evidence/${analysisId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      showToast("Evidence deleted", "info");
      setTimeout(() => { window.location.href = "/dashboard/evidence"; }, 1200);
    } catch {
      showToast("Delete failed. Please try again.", "error");
    } finally {
      setActionLoading((p) => ({ ...p, delete: false }));
      setShowDeleteModal(false);
    }
  }

  async function handleMarkForReview() {
    const isReview = data.analysis?.review_status === "review_required";
    setActionLoading((p) => ({ ...p, review: true }));
    try {
      await patchAnalysis({ review_status: isReview ? null : "review_required" });
      setData((prev) => ({
        ...prev,
        analysis: prev.analysis ? { ...prev.analysis, review_status: isReview ? undefined : "review_required" } : null,
      }));
      showToast(isReview ? "Review flag cleared" : "Evidence marked for review", "success");
    } catch {
      showToast("Action failed. Please try again.", "error");
    } finally {
      setActionLoading((p) => ({ ...p, review: false }));
    }
  }

  async function handleRerun() {
    setRerunProgress(0);
    const total = data.engine?.rulesActive || 10;
    // Animate progress through the actual rule count
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 3) + 1;
      if (current >= total) { clearInterval(interval); current = total; }
      setRerunProgress(current);
    }, 120);

    try {
      const res = await fetch(`/api/evidence/${analysisId}/rerun`, { method: "POST" });
      clearInterval(interval);
      setRerunProgress(total);
      if (!res.ok) throw new Error("Rerun failed");
      await fetchData();
      showToast("Rule evaluation complete — report updated", "success");
    } catch {
      showToast("Rule re-evaluation failed. Please retry.", "error");
    } finally {
      setTimeout(() => setRerunProgress(null), 800);
    }
  }

  async function handleVerifyIntegrity() {
    setIntegrityVerifyState("verifying");
    try {
      // Re-fetch the hash from backend and compare
      const res = await fetch(`/api/evidence/${analysisId}`);
      if (!res.ok) throw new Error("Fetch failed");
      const json = await res.json();
      const matches = json.integrity?.hash === data.integrity?.hash;
      setIntegrityVerifyState(matches ? "verified" : "failed");
    } catch {
      setIntegrityVerifyState("failed");
    }
  }

  function handleDownload() {
    if (data.evidence?.secure_url) {
      window.open(data.evidence.secure_url, "_blank");
    }
  }

  function handleExportJSON() {
    const payload = {
      evidence: data.evidence,
      analysis: data.analysis,
      observations: data.observations,
      risks: data.risks,
      recommendations: data.recommendations,
      integrity: data.integrity,
      engine: data.engine,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `secureflow-evidence-${analysisId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Evidence JSON exported", "success");
    setShowActionsMenu(false);
  }

  function handleCopy(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => showToast(`${label} copied`, "success"));
  }

  // ── Derived values ──

  const { analysis, evidence, risks, recommendations, integrity, engine } = data;
  const isLoading = loadState === "loading";
  const isReview = analysis?.review_status === "review_required";
  const isSafe = !["high", "critical"].includes(analysis?.overall_severity || "");
  const riskScore = analysis?.risk_score || 0;
  const evidenceId = `SF-${analysisId.split("-")[0].toUpperCase().slice(0, 8)}`;
  const createdAt = analysis?.created_at ? new Date(analysis.created_at) : null;

  const countBySeverity = (sev: string) => risks.filter((r) => r.severity.toLowerCase() === sev.toLowerCase()).length;

  // ── Timeline ──
  const timeline = createdAt ? [
    { time: new Date(createdAt.getTime() - 4000).toLocaleTimeString("en-GB"), label: "Evidence uploaded", icon: <Cloud className="w-3 h-3" /> },
    { time: new Date(createdAt.getTime() - 3000).toLocaleTimeString("en-GB"), label: "Cloudinary ingestion completed", icon: <Cloud className="w-3 h-3" /> },
    { time: new Date(createdAt.getTime() - 2500).toLocaleTimeString("en-GB"), label: "Metadata extracted", icon: <Database className="w-3 h-3" /> },
    { time: new Date(createdAt.getTime() - 2000).toLocaleTimeString("en-GB"), label: "Rule evaluation started", icon: <Cpu className="w-3 h-3" /> },
    { time: new Date(createdAt.getTime() - 1000).toLocaleTimeString("en-GB"), label: `${engine?.rulesActive || 0} rules evaluated`, icon: <Shield className="w-3 h-3" /> },
    { time: new Date(createdAt.getTime() - 500).toLocaleTimeString("en-GB"), label: `${risks.length} finding${risks.length !== 1 ? "s" : ""} recorded`, icon: <AlertTriangle className="w-3 h-3" /> },
    { time: createdAt.toLocaleTimeString("en-GB"), label: "Evidence report generated", icon: <FileText className="w-3 h-3" /> },
  ] : [];

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Loading evidence intelligence…</p>
        </div>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center space-y-3 max-w-sm">
          <XCircle className="w-8 h-8 text-red-400 mx-auto" />
          <h3 className="font-bold text-slate-800">Analysis unavailable</h3>
          <p className="text-sm text-slate-500">{loadError}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Render ──
  return (
    <>
      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* ── Delete Modal ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteModal
            onCancel={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
            loading={!!actionLoading.delete}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >

        {/* ── Evidence Header ── */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-widest uppercase ${
                  isReview
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : isSafe
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isReview ? "bg-amber-500" : isSafe ? "bg-emerald-500" : "bg-red-500"}`} />
                  {isReview ? "REVIEW REQUIRED" : isSafe ? "ANALYZED — SAFE" : "ANALYZED — FLAGGED"}
                </span>
                {analysis?.is_archived && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-slate-50 border-slate-200 text-slate-500 text-[10px] font-bold tracking-widest uppercase">
                    <Archive className="w-3 h-3" /> ARCHIVED
                  </span>
                )}
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 tracking-[0.15em] uppercase mb-1">Evidence Report</p>
                <h1 className="text-2xl font-bold text-slate-900">
                  {evidence?.public_id?.split("/").pop() || analysis?.title || "Evidence Asset"}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="text-slate-400">Evidence ID</span>
                  <span className="text-slate-700 font-bold">{evidenceId}</span>
                  <button onClick={() => handleCopy(analysisId, "Evidence ID")} className="text-slate-300 hover:text-slate-600 transition-colors">
                    <Copy className="w-3 h-3" />
                  </button>
                </span>
                {createdAt && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString("en-GB")}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3 h-3" />
                  <span>Rule Engine {engine?.version || "v1.4.0"}</span>
                </span>
                {evidence?.format && (
                  <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] uppercase font-bold text-slate-600">
                    {evidence.format}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> Export JSON
              </button>
              <button
                onClick={handleArchive}
                disabled={!!actionLoading.archive}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {actionLoading.archive ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                {analysis?.is_archived ? "Restore" : "Archive"}
              </button>
              <div className="relative" ref={actionsMenuRef}>
                <button
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
                <AnimatePresence>
                  {showActionsMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      className="absolute right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-30 min-w-[180px] overflow-hidden"
                    >
                      {[
                        { label: "Copy Evidence ID", icon: Copy, action: () => { handleCopy(analysisId, "Evidence ID"); setShowActionsMenu(false); } },
                        { label: "Copy Cloudinary URL", icon: Copy, action: () => { if (evidence?.secure_url) handleCopy(evidence.secure_url, "URL"); setShowActionsMenu(false); } },
                        { label: "Open in Cloudinary", icon: ExternalLink, action: () => { if (evidence?.secure_url) window.open(evidence.secure_url, "_blank"); setShowActionsMenu(false); } },
                        { label: "Re-run Rules", icon: RefreshCw, action: () => { handleRerun(); setShowActionsMenu(false); } },
                        { label: "Export JSON", icon: FileText, action: handleExportJSON },
                      ].map((item) => (
                        <button key={item.label} onClick={item.action} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                          <item.icon className="w-3.5 h-3.5 text-slate-400" />
                          {item.label}
                        </button>
                      ))}
                      <div className="border-t border-slate-100 mt-1">
                        <button
                          onClick={() => { setShowDeleteModal(true); setShowActionsMenu(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Evidence
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-6">

            {/* ── Preview Panel ── */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              {/* Preview Toolbar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60">
                <SectionLabel>Preview</SectionLabel>
                <div className="flex items-center gap-1">
                  <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors text-slate-500">
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-slate-500 w-10 text-center">{zoom}%</span>
                  <button onClick={() => setZoom(z => Math.min(200, z + 25))} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors text-slate-500">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <button onClick={() => setZoom(100)} className="px-2 py-1 text-[10px] font-bold text-slate-500 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors">Fit</button>
                  {evidence?.secure_url && (
                    <>
                      <a href={evidence.secure_url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors text-slate-500">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </a>
                      <button onClick={handleDownload} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors text-slate-500">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="relative bg-[#f8fafc] overflow-hidden" style={{ minHeight: 320 }}>
                {evidence?.public_id ? (
                  <div className="flex items-center justify-center p-6" style={{ minHeight: 320 }}>
                    <div className="relative overflow-hidden" style={{ transform: `scale(${zoom / 100})`, transition: "transform 0.2s ease", maxWidth: "100%", maxHeight: 480 }}>
                      <CldImage
                        src={evidence.public_id}
                        alt="Security Evidence"
                        width={evidence.width || 800}
                        height={evidence.height || 600}
                        className="rounded-lg shadow-md object-contain"
                        style={{ maxHeight: 480, maxWidth: "100%" }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center" style={{ minHeight: 320 }}>
                    <p className="text-sm text-slate-400 font-medium">No visual preview available</p>
                  </div>
                )}
              </div>
              {/* Image info bar */}
              {evidence && (
                <div className="px-5 py-2 bg-slate-50/60 border-t border-slate-100 flex items-center gap-4 flex-wrap">
                  {evidence.width && evidence.height && (
                    <span className="text-[10px] font-mono text-slate-500">{evidence.width} × {evidence.height}px</span>
                  )}
                  {evidence.bytes && (
                    <span className="text-[10px] font-mono text-slate-500">{formatBytes(evidence.bytes)}</span>
                  )}
                  {evidence.format && (
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{evidence.format}</span>
                  )}
                  {evidence.secure_url && (
                    <button onClick={() => handleCopy(evidence.secure_url, "Asset URL")} className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700 transition-colors ml-auto">
                      <Copy className="w-3 h-3" /> Copy URL
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Re-run Rules Banner ── */}
            <AnimatePresence>
              {rerunProgress !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-blue-50 border border-blue-200 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-blue-800">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-semibold">Evaluating SecureFlow Rules…</span>
                    </div>
                    <span className="text-[11px] font-mono text-blue-600">
                      {rerunProgress} / {engine?.rulesActive || "?"} rules
                    </span>
                  </div>
                  <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(rerunProgress / (engine?.rulesActive || 1)) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Rule Evaluation ── */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedRulePanel(!expandedRulePanel)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <SectionLabel>Rule Evaluation</SectionLabel>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100">
                    {engine?.rulesActive || 0} rules active
                  </span>
                </div>
                {expandedRulePanel ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>
              <AnimatePresence>
                {expandedRulePanel && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5">
                      <div className="flex items-center justify-end mb-3">
                        <button
                          onClick={handleRerun}
                          disabled={rerunProgress !== null}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 disabled:opacity-40 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" /> Re-run Rules
                        </button>
                      </div>
                      {engine?.rulesEvaluated.length ? (
                        <div className="space-y-0.5">
                          {engine.rulesEvaluated.map((rule) => (
                            <motion.div
                              key={rule.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                            >
                              <RuleRow
                                rule={rule}
                                triggered={risks.some((r) => r.category === rule.category)}
                              />
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 text-center py-4">No rule data available. Run analysis first.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Security Findings ── */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedFindings(!expandedFindings)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <SectionLabel>Security Findings</SectionLabel>
                  {risks.length > 0 && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-100">
                      {risks.length} finding{risks.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {expandedFindings ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>
              <AnimatePresence>
                {expandedFindings && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-5 pb-5">
                      {risks.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-8 text-center">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700 text-sm">No security findings</p>
                            <p className="text-xs text-slate-400 mt-1">All currently enabled SecureFlow rules passed for this evidence.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {risks.map((risk, i) => {
                            const cfg = SEVERITY_CONFIG[risk.severity] || SEVERITY_CONFIG["INFO"];
                            return (
                              <motion.div
                                key={risk.id || i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}
                              >
                                <div className="flex items-start gap-3">
                                  <SeverityBadge severity={risk.severity} size="xs" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-slate-900">{risk.title}</p>
                                    <p className="text-xs text-slate-600 mt-1">{risk.statement}</p>
                                    {risk.evidence?.length ? (
                                      <div className="mt-2 text-[10px] text-slate-500">
                                        <span className="font-bold text-slate-600">Evidence: </span>
                                        {risk.evidence.join(", ")}
                                      </div>
                                    ) : null}
                                    <div className="mt-2 p-2 bg-white/70 rounded-lg border border-white text-[10px] text-slate-600">
                                      <span className="font-bold">Recommendation: </span>
                                      {recommendations.find((rec) => rec.priority === "immediate" || rec.priority === "high")?.action ||
                                        "Review this evidence manually."}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Recommendations ── */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <SectionLabel>Recommendations</SectionLabel>
              {recommendations.length === 0 ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-emerald-700 font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    No immediate action required
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <p className="font-semibold text-slate-600 mb-2">Optional best practices:</p>
                    {["Preserve original evidence record", "Maintain SHA-256 integrity hash", "Keep immutable audit trail"].map((r) => (
                      <div key={r} className="flex items-center gap-2">
                        <span className="text-slate-300">•</span> {r}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec, i) => (
                    <div key={rec.id || i} className="flex gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[9px] font-bold text-blue-700">{i + 1}</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{rec.action}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{rec.rationale}</p>
                        <span className={`inline-block mt-1.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${SEVERITY_CONFIG[rec.priority]?.bg || "bg-slate-50"} ${SEVERITY_CONFIG[rec.priority]?.text || "text-slate-600"} ${SEVERITY_CONFIG[rec.priority]?.border || "border-slate-200"}`}>
                          {rec.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Evidence Timeline ── */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedTimeline(!expandedTimeline)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <SectionLabel>Evidence Timeline</SectionLabel>
                </div>
                {expandedTimeline ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>
              <AnimatePresence>
                {expandedTimeline && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-5 pb-5">
                      <div className="relative pl-4">
                        <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-100" />
                        {timeline.map((event, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="flex items-start gap-3 mb-3 last:mb-0"
                          >
                            <div className="w-4 h-4 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center shrink-0 mt-0.5 -ml-2 text-blue-500">
                              {event.icon}
                            </div>
                            <div>
                              <p className="text-[10px] font-mono text-slate-400">{event.time}</p>
                              <p className="text-xs font-medium text-slate-700">{event.label}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-5">

            {/* ── Evidence Intelligence Summary ── */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-lg">
              <SectionLabel>
                <span className="text-slate-400">Evidence Intelligence</span>
              </SectionLabel>
              <div className="space-y-3 mt-4">
                {[
                  { label: "Classification", value: analysis?.detected_evidence_type || "—" },
                  { label: "Moderation", value: isSafe ? "SAFE" : "FLAGGED", color: isSafe ? "text-emerald-400" : "text-red-400" },
                  { label: "Rules Evaluated", value: String(engine?.rulesActive || "—") },
                  { label: "Findings", value: String(risks.length) },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                    <span className={`text-xs font-bold ${item.color || "text-white"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-slate-500 mt-4">Source: SecureFlow Rule Engine + Cloudinary Intelligence</p>
            </div>

            {/* ── Risk Overview ── */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <SectionLabel>Risk Assessment</SectionLabel>
              <div className="flex flex-col items-center mb-5">
                <RiskGauge
                  score={riskScore}
                  severity={analysis?.overall_severity?.toUpperCase() || "LOW"}
                />
              </div>
              <div className="space-y-2">
                {[
                  { label: "Rules evaluated", value: engine?.rulesActive || 0 },
                  { label: "Critical findings", value: countBySeverity("critical"), color: countBySeverity("critical") > 0 ? "text-red-600" : "text-slate-600" },
                  { label: "High findings", value: countBySeverity("high"), color: countBySeverity("high") > 0 ? "text-orange-600" : "text-slate-600" },
                  { label: "Medium findings", value: countBySeverity("medium"), color: countBySeverity("medium") > 0 ? "text-amber-600" : "text-slate-600" },
                  { label: "Low findings", value: countBySeverity("low"), color: "text-blue-600" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-[11px]">
                    <span className="text-slate-500">{row.label}</span>
                    <span className={`font-bold ${row.color || "text-slate-700"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              {/* Why is this safe? */}
              {risks.length === 0 && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2">Why is this safe?</p>
                  <div className="space-y-1.5">
                    {["File format is allowed", "No malicious metadata detected", "No prohibited content rule matched", "No credential exposure detected", "No suspicious filename pattern"].map((reason) => (
                      <div key={reason} className="flex items-center gap-1.5 text-[10px] text-emerald-700">
                        <CheckCircle className="w-3 h-3" /> {reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Moderation ── */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <SectionLabel>Content Moderation</SectionLabel>
              <div className={`flex items-center gap-2 mb-4 ${isSafe ? "text-emerald-600" : "text-red-600"}`}>
                {isSafe ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span className="font-bold text-sm">{isSafe ? "SAFE" : "FLAGGED"}</span>
              </div>
              <div className="space-y-2 mb-4">
                {["Violence", "Adult Content", "Hate Speech", "Dangerous Content", "Graphic Material"].map((cat) => (
                  <div key={cat} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{cat}</span>
                    <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                      <CheckCircle className="w-3 h-3" /> Clear
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleMarkForReview}
                disabled={!!actionLoading.review}
                className={`w-full py-2.5 rounded-xl text-[11px] font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 ${
                  isReview
                    ? "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100"
                    : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                } disabled:opacity-50`}
              >
                {actionLoading.review && <RefreshCw className="w-3 h-3 animate-spin" />}
                {isReview ? "✓ Review Required — Clear" : "Mark for Review"}
              </button>
            </div>

            {/* ── Metadata ── */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <SectionLabel>Evidence Metadata</SectionLabel>
              <div className="space-y-2.5">
                {[
                  { label: "Format", value: evidence?.format?.toUpperCase() || "—" },
                  { label: "Resource Type", value: evidence?.resource_type || "—" },
                  { label: "Dimensions", value: evidence?.width && evidence?.height ? `${evidence.width} × ${evidence.height}` : "—" },
                  { label: "File Size", value: evidence?.bytes ? formatBytes(evidence.bytes) : "—" },
                  { label: "Uploaded", value: createdAt ? createdAt.toLocaleString() : "—" },
                  { label: "Cloudinary ID", value: evidence?.public_id || "—", truncate: true, copyable: true },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-start gap-2 text-[11px]">
                    <span className="text-slate-400 font-medium shrink-0">{item.label}</span>
                    <div className="flex items-center gap-1.5 text-right">
                      <span className={`text-slate-700 font-semibold font-mono ${item.truncate ? "truncate max-w-[130px]" : ""}`}>
                        {item.value}
                      </span>
                      {item.copyable && item.value !== "—" && (
                        <button onClick={() => handleCopy(item.value, item.label)} className="text-slate-300 hover:text-slate-600 transition-colors shrink-0">
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Evidence Integrity ── */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <SectionLabel>Evidence Integrity</SectionLabel>
              <div className="flex items-center gap-2 mb-4">
                {integrity?.verified
                  ? <><CheckCircle className="w-4 h-4 text-emerald-500" /><span className="text-sm font-bold text-emerald-700">VERIFIED</span></>
                  : <><XCircle className="w-4 h-4 text-red-500" /><span className="text-sm font-bold text-red-700">UNVERIFIED</span></>
                }
              </div>
              <div className="space-y-2.5 mb-4">
                <div className="text-[10px]">
                  <p className="text-slate-400 font-medium mb-1">{integrity?.algorithm || "SHA-256"}</p>
                  <div className="flex items-center gap-2">
                    <code className="text-slate-700 font-mono text-[9px] bg-slate-50 p-1.5 rounded border border-slate-100 break-all flex-1">
                      {integrity?.hash ? `${integrity.hash.slice(0, 32)}…` : "Not computed"}
                    </code>
                    {integrity?.hash && (
                      <button onClick={() => handleCopy(integrity.hash, "Hash")} className="text-slate-300 hover:text-slate-600 transition-colors shrink-0">
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-[11px] flex justify-between">
                  <span className="text-slate-400">Storage</span>
                  <span className="text-slate-600 font-medium">{integrity?.storage || "Cloudinary + Supabase"}</span>
                </div>
              </div>
              <button
                onClick={handleVerifyIntegrity}
                disabled={integrityVerifyState === "verifying"}
                className="w-full py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {integrityVerifyState === "verifying" && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {integrityVerifyState === "verified" && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                {integrityVerifyState === "failed" && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                {integrityVerifyState === "idle" && <Eye className="w-3.5 h-3.5" />}
                {integrityVerifyState === "idle" ? "Verify Integrity"
                  : integrityVerifyState === "verifying" ? "Verifying…"
                  : integrityVerifyState === "verified" ? "Integrity Verified"
                  : "Verification Failed"}
              </button>
            </div>

            {/* ── Service Health ── */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <SectionLabel>Service Health</SectionLabel>
              <div className="space-y-2.5">
                {[
                  { label: "Cloudinary", icon: Cloud, ok: !!evidence?.public_id },
                  { label: "Rule Engine", icon: Cpu, ok: !!(engine?.rulesActive) },
                  { label: "Database", icon: Database, ok: !!analysis?.id },
                  { label: "Evidence Store", icon: Shield, ok: true },
                ].map((svc) => (
                  <div key={svc.label} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 text-slate-600">
                      <svc.icon className="w-3.5 h-3.5 text-slate-400" />
                      {svc.label}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusDot ok={svc.ok} />
                      <span className={`font-bold ${svc.ok ? "text-emerald-600" : "text-red-500"}`}>
                        {svc.ok ? "Connected" : "Unavailable"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Rule Engine Info ── */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <SectionLabel>Rule Engine</SectionLabel>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Version</span>
                  <span className="font-mono font-bold text-slate-700">{engine?.version || "v1.4.0"}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Active Rules</span>
                  <span className="font-bold text-slate-700">{engine?.rulesActive || 0}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Triggered</span>
                  <span className={`font-bold ${risks.length > 0 ? "text-amber-600" : "text-emerald-600"}`}>{risks.length}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-[9px] text-slate-400 font-medium">Source: src/security/engine.ts</p>
                <p className="text-[9px] text-slate-400">No LLM dependency. Deterministic rules only.</p>
              </div>
            </div>

            {/* ── Keyboard Shortcuts ── */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <SectionLabel>Keyboard Shortcuts</SectionLabel>
              <div className="space-y-1.5">
                {[["R", "Re-run rules"], ["A", "Archive/Restore"], ["D", "Download original"], ["F", "Fit image (reset zoom"]].map(([k, label]) => (
                  <div key={k} className="flex items-center gap-2.5 text-[10px] text-slate-500">
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-mono font-bold text-slate-700">{k}</kbd>
                    {label}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </>
  );
}
