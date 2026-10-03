"use client";

import React, { createContext, useContext, useState, useRef } from "react";
import type { SecurityEvidence } from "@/lib/cloudinary/types";
import type { SecurityAnalysisResult } from "@/lib/ai/schemas";
import { useRouter } from "next/navigation";

export type Mode = "evidence" | "text";
export type UploadState =
  | "EMPTY"
  | "UPLOADING"
  | "UPLOADED"
  | "ANALYZING"
  | "CLASSIFYING"
  | "MODERATING"
  | "READY"
  | "REASONING"
  | "DONE"
  | "AI_UNAVAILABLE"  // Upload + media analysis succeeded, but AI security analysis is unavailable
  | "ERROR";

export interface MediaIntelligence {
  detectedContent?: string | null;
  tags?: string[];
  moderation?: string;
  metadata?: Record<string, string>;
  diagnostics?: Record<string, string>;
}

// Structured error returned from the backend pipeline
export interface PipelineError {
  stage: string;
  code: string;
  message: string;
  retryable: boolean;
  /** Set when the Cloudinary upload succeeded even though AI analysis failed */
  uploadSucceeded?: boolean;
  /** The partial evidence/analysis ID created even when AI failed */
  evidenceId?: string | null;
}

interface AnalysisContextType {
  mode: Mode;
  setMode: (m: Mode) => void;
  title: string;
  setTitle: (t: string) => void;
  submitting: boolean;
  error: string | null;
  pipelineError: PipelineError | null;
  uploadState: UploadState;
  evidence: SecurityEvidence | null;
  intelligence: MediaIntelligence;
  securityResult: SecurityAnalysisResult | null;
  dragging: boolean;
  setDragging: (d: boolean) => void;
  content: string;
  setContent: (c: string) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  handleMediaUpload: (f: File) => Promise<void>;
  handleSecurityReasoning: () => Promise<void>;
  handleSubmitText: (e: React.FormEvent) => Promise<void>;
  resetAll: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | null>(null);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("evidence");
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pipelineError, setPipelineError] = useState<PipelineError | null>(null);

  const [uploadState, setUploadState] = useState<UploadState>("EMPTY");
  const [evidence, setEvidence] = useState<SecurityEvidence | null>(null);
  const [intelligence, setIntelligence] = useState<MediaIntelligence>({});
  const [securityResult, setSecurityResult] =
    useState<SecurityAnalysisResult | null>(null);
  const [dragging, setDragging] = useState(false);

  const [content, setContent] = useState("");

  function resetAll() {
    setUploadState("EMPTY");
    setEvidence(null);
    setIntelligence({});
    setSecurityResult(null);
    setError(null);
    setPipelineError(null);
    setTitle("");
  }

  async function handleMediaUpload(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds 10MB limit.");
      setUploadState("ERROR");
      return;
    }
    setError(null);
    setPipelineError(null);
    setUploadState("UPLOADING");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok)
        throw new Error(uploadData.error || "Upload failed");

      const asset = uploadData.asset as SecurityEvidence;
      setEvidence(asset);
      if (!title) setTitle(`Evidence: ${file.name}`);

      const basePayload = {
        assetId: asset.assetId,
        publicId: asset.publicId,
        resourceType: asset.resourceType,
      };
      const newIntel: MediaIntelligence = { diagnostics: {} };

      setUploadState("ANALYZING");
      const visRes = await fetch("/api/media/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...basePayload, action: "vision" }),
      });
      const visData = await visRes.json();
      newIntel.detectedContent = visData.detectedContent;
      if (newIntel.diagnostics) newIntel.diagnostics.vision = visData.diagnostics;

      setUploadState("CLASSIFYING");
      const tagRes = await fetch("/api/media/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...basePayload, action: "tagging" }),
      });
      const tagData = await tagRes.json();
      newIntel.tags = tagData.tags;
      if (newIntel.diagnostics) newIntel.diagnostics.tagging = tagData.diagnostics;

      setUploadState("MODERATING");
      const modRes = await fetch("/api/media/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...basePayload, action: "moderation" }),
      });
      const modData = await modRes.json();
      newIntel.moderation = modData.moderation;
      if (newIntel.diagnostics) newIntel.diagnostics.moderation = modData.diagnostics;

      const metaRes = await fetch("/api/media/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...basePayload,
          action: "metadata",
          visionSuccess: visData.success,
          taggingSuccess: tagData.success,
          moderationState: modData.moderation,
        }),
      });
      const metaData = await metaRes.json();
      newIntel.metadata = metaData.metadata;

      setIntelligence(newIntel);
      setUploadState("READY");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process media pipeline"
      );
      setUploadState("ERROR");
    }
  }

  async function handleSecurityReasoning() {
    setSubmitting(true);
    setUploadState("REASONING");
    setError(null);
    setPipelineError(null);
    try {
      const payload = {
        evidence,
        cloudinaryIntelligence: intelligence,
        userContext: title,
      };
      const res = await fetch("/api/security/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        // Detect OpenAI billing/rate-limit errors (402) — upload succeeded, AI unavailable
        const isAiUnavailable =
          res.status === 402 ||
          data.code === "OPENAI_RATE_LIMITED" ||
          data.code === "OPENAI_AUTH_ERROR";

        if (data.stage && data.code) {
          setPipelineError({
            stage: data.stage,
            code: data.code,
            message: data.error || "Security reasoning failed",
            retryable: data.retryable ?? false,
            uploadSucceeded: data.uploadSucceeded ?? false,
            evidenceId: data.evidenceId ?? null,
          });
          setError(data.error || "Security reasoning failed");
        } else {
          setError(data.error || "Security reasoning failed");
        }

        // If the upload succeeded but AI is unavailable, show a distinct state
        if (isAiUnavailable) {
          setUploadState("AI_UNAVAILABLE");
        } else {
          setUploadState("READY"); // return to READY so user can retry
        }
        return;
      }

      setSecurityResult(data.analysis);
      setUploadState("DONE");

      if (data.analysisId) {
        router.push(`/dashboard/evidence/${data.analysisId}`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Security reasoning failed"
      );
      setUploadState("READY");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitText(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 3 || content.trim().length < 10) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), input_content: content.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      router.push(`/dashboard/analysis/${data.analysis.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
      setSubmitting(false);
    }
  }

  return (
    <AnalysisContext.Provider
      value={{
        mode,
        setMode,
        title,
        setTitle,
        submitting,
        error,
        pipelineError,
        uploadState,
        evidence,
        intelligence,
        securityResult,
        dragging,
        setDragging,
        content,
        setContent,
        fileRef,
        handleMediaUpload,
        handleSecurityReasoning,
        handleSubmitText,
        resetAll,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}
