import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface SidebarHealthFooterProps {
  cloudinary: boolean;
  openai: boolean;
  supabase: boolean;
}

function ServiceRow({
  label,
  connected,
  customLabel,
}: {
  label: string;
  connected: boolean;
  customLabel?: string;
}) {
  const statusText = customLabel ?? (connected ? "Connected" : "Not configured");
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-semibold text-[--color-ink-3]">{label}</span>
      <div className="flex items-center gap-1">
        {connected ? (
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        ) : (
          <XCircle className="w-3 h-3 text-red-400" />
        )}
        <span
          className={`text-[10px] font-bold ${
            connected ? "text-emerald-600" : "text-red-400"
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
}: SidebarHealthFooterProps) {
  return (
    <div className="flex-shrink-0 border-t border-[--color-rule] px-4 py-3 bg-[--color-surface-2]">
      <p className="text-[9px] font-bold text-[--color-ink-4] uppercase tracking-widest mb-2">
        Service Health
      </p>
      <div className="space-y-1.5">
        <ServiceRow label="Cloudinary" connected={cloudinary} />
        <ServiceRow
          label="AI Engine"
          connected={openai}
          customLabel={openai ? "OpenAI Ready" : "Not configured"}
        />
        <ServiceRow label="Database" connected={supabase} />
      </div>
    </div>
  );
}
