import { ArrowDown } from "lucide-react";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata = { title: "Pipeline - SecureFlow AI" };

export default function PipelinePage() {
  const isCloudinaryConfigured = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;
  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  const PipelineNode = ({ title, children, isLast = false }: { title: string, children: React.ReactNode, isLast?: boolean }) => (
    <div className="flex flex-col items-center">
      <div className="border border-[--color-rule-strong] bg-[--color-surface] p-6 w-full max-w-lg hover:bg-[--color-surface-2] transition-colors">
        <p className="font-editorial text-xl text-[--color-ink] uppercase mb-4 tracking-wider text-center">{title}</p>
        <div className="space-y-3 font-technical text-xs tracking-widest uppercase">
          {children}
        </div>
      </div>
      {!isLast && (
        <div className="py-6 flex flex-col items-center gap-2 text-[--color-ink-4]">
          <div className="w-[1px] h-8 bg-[--color-rule-strong]"></div>
          <ArrowDown className="w-4 h-4" />
        </div>
      )}
    </div>
  );

  const StatusRow = ({ label, status, type = "success" }: { label: string, status: string, type?: "success" | "pending" | "offline" }) => {
    let colorClass = "text-[--color-ink]";
    let icon = "✓";
    if (type === "pending") {
      colorClass = "text-[--color-ink-3]";
      icon = "⧖";
    } else if (type === "offline") {
      colorClass = "text-[--color-low]";
      icon = "✕";
    }

    return (
      <div className="flex justify-between items-center border-b border-[--color-rule-light] pb-2 last:border-b-0 last:pb-0">
        <span className="text-[--color-ink-3]">{label}</span>
        <div className={`flex items-center gap-2 ${colorClass}`}>
          <span>{status}</span>
          <span className="w-4 text-center">{icon}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="px-8 lg:px-12 pt-8 pb-24 max-w-[1400px] mx-auto w-full">
      <Breadcrumbs items={[
        { label: "PIPELINE" },
        { label: "VIEWER" }
      ]} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-[--color-rule] pb-6">
        <div>
          <h1 className="font-editorial text-3xl tracking-wide uppercase text-[--color-ink] mb-3">
            SecureFlow Pipeline
          </h1>
          <p className="font-ui text-sm text-[--color-ink-2] leading-relaxed">
            Data ingestion, media intelligence, and security reasoning flow.
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 text-right">
          <div className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-1">
            ARCHITECTURE
          </div>
          <div className="font-technical text-sm text-[--color-ink]">
            EVENT-DRIVEN
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <p className="font-technical text-sm tracking-widest text-[--color-ink-3] uppercase mb-6">INGESTION</p>
        <div className="py-2 flex flex-col items-center gap-2 text-[--color-ink-4] mb-6">
          <div className="w-[1px] h-6 bg-[--color-rule-strong]"></div>
          <ArrowDown className="w-4 h-4" />
        </div>

        <PipelineNode title="Cloudinary">
          <StatusRow label="Upload" status={isCloudinaryConfigured ? "✓" : "OFFLINE"} type={isCloudinaryConfigured ? "success" : "offline"} />
        </PipelineNode>

        <PipelineNode title="Optimization">
          <StatusRow label="f_auto" status="✓" />
          <StatusRow label="q_auto" status="✓" />
        </PipelineNode>

        <PipelineNode title="AI Media Intelligence">
          <StatusRow label="Vision" status={isCloudinaryConfigured ? "AVAILABLE" : "UNAVAILABLE"} />
          <StatusRow label="Tagging" status={isCloudinaryConfigured ? "AVAILABLE" : "UNAVAILABLE"} />
          <StatusRow label="Moderation" status="AVAILABLE" />
        </PipelineNode>

        <PipelineNode title="Security Engine">
          <StatusRow 
            label="OpenAI" 
            status={isOpenAIConfigured ? "CONFIGURED" : "OFFLINE"} 
            type={isOpenAIConfigured ? "success" : "offline"} 
          />
          <StatusRow label="Cloudinary" status={isCloudinaryConfigured ? "AVAILABLE" : "UNAVAILABLE"} />
          <StatusRow label="Local Rules" status="READY" />
        </PipelineNode>

        <PipelineNode title="Persistence">
          <StatusRow label="Supabase" status={isSupabaseConfigured ? "✓" : "OFFLINE"} type={isSupabaseConfigured ? "success" : "offline"} />
        </PipelineNode>

        <PipelineNode title="Report" isLast={true}>
          <div className="text-center mt-2">
            <span className="px-4 py-2 bg-[--color-ink] text-[--color-background] font-technical text-xs tracking-widest uppercase">
              READY
            </span>
          </div>
        </PipelineNode>
      </div>
    </div>
  );
}
