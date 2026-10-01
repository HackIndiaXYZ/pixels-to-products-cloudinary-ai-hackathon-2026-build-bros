"use client";

import { useState } from "react";
import { SeverityBadge } from "@/components/ui/badge";
import { getRiskBorderClass } from "@/lib/utils";
import type { Finding, RiskSeverity } from "@/types";

const SEV_ORDER: RiskSeverity[] = ["critical", "high", "medium", "low", "info"];

interface FindingCardProps {
  finding: Finding;
  index: number;
}

function FindingCard({ finding, index }: FindingCardProps) {
  const [open, setOpen] = useState(index < 2);
  const num = String(index + 1).padStart(2, "0");

  return (
    <div
      className={getRiskBorderClass(finding.severity)}
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-rule)",
        borderLeftWidth: "3px",
        marginBottom: "0",
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-6 py-5"
        aria-expanded={open}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Number + severity row */}
            <div className="flex items-center gap-3 mb-2">
              <span
                className="font-technical text-xs"
                style={{ color: "var(--color-ink-4)" }}
              >
                {num}
              </span>
              <SeverityBadge severity={finding.severity} />
              {finding.cvss !== undefined && finding.cvss !== null && (
                <span
                  className="font-technical text-xs"
                  style={{ color: "var(--color-ink-3)" }}
                >
                  CVSS {Number(finding.cvss).toFixed(1)}
                </span>
              )}
            </div>

            {/* Title */}
            <p
              className="font-ui text-sm font-semibold leading-snug"
              style={{ color: "var(--color-ink)" }}
            >
              {finding.title}
            </p>

            {/* Category path */}
            <p
              className="font-ui text-xs mt-1"
              style={{ color: "var(--color-ink-3)" }}
            >
              {finding.category}
              {finding.subcategory ? ` / ${finding.subcategory}` : ""}
            </p>

            {/* Location */}
            {finding.location && (
              <p
                className="font-technical text-xs mt-1"
                style={{ color: "var(--color-ink-4)" }}
              >
                ↳ {finding.location}
              </p>
            )}
          </div>

          <span
            className="font-technical text-xs flex-shrink-0 mt-0.5"
            style={{ color: "var(--color-ink-4)" }}
          >
            {open ? "▲" : "▼"}
          </span>
        </div>
      </button>

      {/* Expanded body */}
      {open && (
        <div
          style={{ borderTop: "1px solid var(--color-rule-light)" }}
        >
          {/* Framework refs */}
          {finding.framework_refs?.length > 0 && (
            <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--color-rule-light)" }}>
              <p
                className="eyebrow mb-2"
                style={{ color: "var(--color-ink-4)" }}
              >
                FRAMEWORK REFERENCES
              </p>
              <div className="flex flex-wrap gap-2">
                {finding.framework_refs.map((ref, i) => (
                  <span
                    key={i}
                    className="font-technical text-xs px-2 py-0.5"
                    style={{
                      border: "1px solid var(--color-rule)",
                      color: "var(--color-ink-2)",
                      backgroundColor: "var(--color-surface-2)",
                    }}
                  >
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* What's the risk */}
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--color-rule-light)" }}>
            <p className="eyebrow mb-2" style={{ color: "var(--color-ink-4)" }}>
              WHAT&apos;S THE RISK
            </p>
            <p className="font-ui text-sm leading-relaxed" style={{ color: "var(--color-ink-2)" }}>
              {finding.description}
            </p>
          </div>

          {/* How to fix */}
          <div className="px-6 py-4">
            <p className="eyebrow mb-2" style={{ color: "var(--color-ink-4)" }}>
              HOW TO FIX IT
            </p>
            <p
              className="font-ui text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: "var(--color-ink)" }}
            >
              {finding.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function FindingsList({ findings }: { findings: Finding[] }) {
  const sorted = [...findings].sort(
    (a, b) => SEV_ORDER.indexOf(a.severity) - SEV_ORDER.indexOf(b.severity)
  );

  const counts = findings.reduce(
    (acc, f) => { acc[f.severity] = (acc[f.severity] ?? 0) + 1; return acc; },
    {} as Record<RiskSeverity, number>
  );

  return (
    <div>
      {/* Section heading */}
      <div
        className="flex items-end justify-between py-4"
        style={{ borderBottom: "1px solid var(--color-rule)", marginBottom: "0" }}
      >
        <div>
          <p className="eyebrow mb-1">FINDINGS</p>
          <p
            className="font-editorial text-base"
            style={{ color: "var(--color-ink-2)" }}
          >
            {findings.length} {findings.length === 1 ? "issue" : "issues"} identified
          </p>
        </div>
        {/* Severity breakdown */}
        <div className="flex items-center gap-2">
          {SEV_ORDER.map((s) =>
            counts[s] ? (
              <div key={s} className="flex items-center gap-1">
                <SeverityBadge severity={s} />
                <span
                  className="font-technical text-xs"
                  style={{ color: "var(--color-ink-4)" }}
                >
                  ×{counts[s]}
                </span>
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Findings */}
      <div style={{ borderBottom: "1px solid var(--color-rule)" }}>
        {sorted.map((f, i) => (
          <div key={f.id} style={{ borderBottom: "1px solid var(--color-rule-light)" }}>
            <FindingCard finding={f} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
