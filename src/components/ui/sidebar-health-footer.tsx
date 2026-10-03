import { CheckCircle2, XCircle, AlertCircle, Circle } from "lucide-react";

export type ServiceStatus = "operational" | "degraded" | "offline" | "unconfigured" | "optional";

interface SidebarHealthFooterProps {
  cloudinary: boolean;
  openai: boolean;
  supabase: boolean;
  openaiStatus?: ServiceStatus;
}

function ServiceRow({
  label,
  status,
  customLabel,
}: {
  label: string;
  status: ServiceStatus;
  customLabel?: string;
}) {
  const statusText =
    customLabel ??
    (status === "operational"
      ? "Connected"
      : status === "degraded"
      ? "Degraded"
      : status === "optional"
      ? "Optional"
      : status === "unconfigured"
      ? "Not configured"
      : "Offline");

  return (
    <div className="flex items-center justify-between group">
      <span className="text-[10.5px] font-medium text-slate-500 group-hover:text-slate-700 transition-colors">{label}</span>
      <div className="flex items-center gap-1.5 w-[72px] justify-start">
        {status === "operational" ? (
          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" strokeWidth={2.5} />
        ) : status === "degraded" ? (
          <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" strokeWidth={2.5} />
        ) : status === "optional" || status === "unconfigured" ? (
          <Circle className="w-3 h-3 text-slate-300 shrink-0" strokeWidth={2.5} />
        ) : (
          <XCircle className="w-3 h-3 text-red-400 shrink-0" strokeWidth={2.5} />
        )}
        <span
          className={`text-[9px] font-bold tracking-wide uppercase ${
            status === "operational"
              ? "text-emerald-600"
              : status === "degraded"
              ? "text-amber-600"
              : status === "optional" || status === "unconfigured"
              ? "text-slate-400"
              : "text-red-500"
          }`}
        >
          {statusText}
        </span>
      </div>
    </div>
  );
}

export function SidebarHealthFooter({
  cloudinary,
  openai,
  supabase,
  openaiStatus,
}: SidebarHealthFooterProps) {
  return (
    <div className="flex-shrink-0 p-4 pb-5">
      <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-3.5 space-y-2.5 shadow-[0_2px_8px_rgb(15,23,42,0.02)]">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.14em] mb-1">
          Service Health
        </p>
        <div className="space-y-2">
          <ServiceRow
            label="Cloudinary"
            status={cloudinary ? "operational" : "unconfigured"}
          />
          <ServiceRow
            label="Rule Engine"
            status="operational"
            customLabel="Active"
          />
          <ServiceRow
            label="Database"
            status={supabase ? "operational" : "unconfigured"}
          />
          <ServiceRow
            label="OpenAI"
            status="optional"
            customLabel="Optional"
          />
        </div>
      </div>
    </div>
  );
}
