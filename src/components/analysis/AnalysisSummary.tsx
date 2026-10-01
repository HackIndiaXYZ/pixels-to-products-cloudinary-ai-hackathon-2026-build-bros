"use client";

import { SeverityBadge } from "@/components/ui/badge";
import type { AnalysisResult } from "@/types";

interface Props {
  analysis: AnalysisResult;
}

export function AnalysisSummary({ analysis }: Props) {
  const criticalCount = analysis.findings.filter((f) => f.severity === "critical").length;
  const highCount     = analysis.findings.filter((f) => f.severity === "high").length;
  const totalCH       = criticalCount + highCount;

  return (
    <div>
      {/* ── Risk score block ───────────────────────────────────────────── */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-rule)",
          marginBottom: "0",
        }}
      >
        {/* Risk score */}
        <div
          className="px-8 py-7"
          style={{ borderRight: "1px solid var(--color-rule)" }}
        >
          <p className="eyebrow mb-3" style={{ color: "var(--color-ink-4)" }}>RISK SCORE</p>
          <div className="flex items-baseline gap-2">
            <span
              style={{
                fontFamily: "var(--font-editorial)",
                fontSize: "3.5rem",
                lineHeight: 1,
                color: `var(--color-${analysis.overall_severity})`,
              }}
            >
              {analysis.risk_score}
            </span>
            <span className="font-ui text-sm" style={{ color: "var(--color-ink-4)" }}>
              / 100
            </span>
          </div>
        </div>

        {/* Overall severity */}
        <div
          className="px-8 py-7"
          style={{ borderRight: "1px solid var(--color-rule)" }}
        >
          <p className="eyebrow mb-3" style={{ color: "var(--color-ink-4)" }}>RISK LEVEL</p>
          <SeverityBadge severity={analysis.overall_severity} />
        </div>

        {/* Counts */}
        <div className="px-8 py-7">
          <p className="eyebrow mb-3" style={{ color: "var(--color-ink-4)" }}>BREAKDOWN</p>
          <div className="flex flex-col gap-1">
            <p className="font-ui text-sm" style={{ color: "var(--color-ink)" }}>
              {analysis.findings.length} findings total
            </p>
            {totalCH > 0 && (
              <p className="font-ui text-sm" style={{ color: "var(--color-critical)" }}>
                {totalCH} critical / high
              </p>
            )}
            <p className="font-ui text-sm" style={{ color: "var(--color-ink-3)" }}>
              {analysis.recommended_actions.length} prioritized actions
            </p>
          </div>
        </div>
      </div>

      {/* ── Executive summary ──────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-rule)",
          borderTop: "none",
        }}
      >
        <div
          className="px-8 py-4"
          style={{ borderBottom: "1px solid var(--color-rule)" }}
        >
          <p className="eyebrow" style={{ color: "var(--color-ink-4)" }}>EXECUTIVE SUMMARY</p>
        </div>
        <div className="px-8 py-6">
          <p
            className="leading-relaxed"
            style={{
              fontFamily: "var(--font-editorial)",
              fontSize: "1rem",
              color: "var(--color-ink-2)",
              lineHeight: "1.7",
            }}
          >
            {analysis.summary}
          </p>
        </div>
      </div>

      {/* ── Prioritized actions ────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-rule)",
          borderTop: "none",
        }}
      >
        <div
          className="px-8 py-4"
          style={{ borderBottom: "1px solid var(--color-rule)" }}
        >
          <p className="eyebrow" style={{ color: "var(--color-ink-4)" }}>PRIORITIZED ACTIONS</p>
        </div>
        <ol>
          {analysis.recommended_actions.map((action, i) => (
            <li
              key={i}
              className="flex items-start gap-5 px-8 py-4"
              style={{ borderBottom: "1px solid var(--color-rule-light)" }}
            >
              <span
                className="font-technical text-xs flex-shrink-0 w-6 text-right"
                style={{ color: "var(--color-ink-4)", paddingTop: "2px" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-ui text-sm leading-relaxed" style={{ color: "var(--color-ink)" }}>
                {action}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
