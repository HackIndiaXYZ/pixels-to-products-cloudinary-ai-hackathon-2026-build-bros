import * as React from "react";
import { cn } from "@/lib/utils";
import type { RiskSeverity } from "@/types";

const SEV_CLASSES: Record<RiskSeverity, string> = {
  critical: "sev-label sev-critical",
  high:     "sev-label sev-high",
  medium:   "sev-label sev-medium",
  low:      "sev-label sev-low",
  info:     "sev-label sev-info",
};

const SEV_TEXT: Record<RiskSeverity, string> = {
  critical: "CRITICAL",
  high:     "HIGH",
  medium:   "MEDIUM",
  low:      "LOW",
  info:     "INFO",
};

interface SeverityBadgeProps {
  severity: RiskSeverity;
  className?: string;
}

/** Monospace severity chip — typography-driven, no icon dependency. */
export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <span className={cn(SEV_CLASSES[severity], className)}>
      {SEV_TEXT[severity]}
    </span>
  );
}

/** Generic label chip */
interface LabelChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "mono";
}
export function LabelChip({ className, variant = "default", ...props }: LabelChipProps) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 text-xs border border-[--color-rule]",
        "text-[--color-ink-2] bg-[--color-surface-2]",
        variant === "mono" && "font-technical",
        className
      )}
      {...props}
    />
  );
}

// Keep Badge as alias for backward compat (used in some pages)
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  severity?: RiskSeverity;
}
export function Badge({ severity, className, children, ...props }: BadgeProps) {
  if (severity) {
    return <SeverityBadge severity={severity} className={className} />;
  }
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 text-xs border border-[--color-rule]",
        "text-[--color-ink-2] bg-[--color-surface-2] font-ui",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
