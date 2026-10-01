import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RiskSeverity } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskColor(severity: RiskSeverity): string {
  const map: Record<RiskSeverity, string> = {
    critical: "text-[--color-critical]",
    high:     "text-[--color-high]",
    medium:   "text-[--color-medium]",
    low:      "text-[--color-low]",
    info:     "text-[--color-info]",
  };
  return map[severity];
}

export function getRiskLabel(severity: RiskSeverity): string {
  const map: Record<RiskSeverity, string> = {
    critical: "CRITICAL",
    high:     "HIGH",
    medium:   "MEDIUM",
    low:      "LOW",
    info:     "INFO",
  };
  return map[severity];
}

export function getRiskBorderClass(severity: RiskSeverity): string {
  const map: Record<RiskSeverity, string> = {
    critical: "finding-critical",
    high:     "finding-high",
    medium:   "finding-medium",
    low:      "finding-low",
    info:     "finding-info",
  };
  return map[severity];
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max) + "…";
}
