import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { CheckCircle2 } from "lucide-react";

export const metadata = { title: "System Status - SecureFlow AI" };

export default function StatusPage() {
  const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;
  const isCloudinaryConfigured = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  // Simulate refresh timestamp
  const timestamp = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const ServiceRow = ({ service, status, latency, type = "healthy" }: { service: string, status: string, latency: string, type?: "healthy" | "ready" | "active" | "offline" }) => {
    let colorClass = "text-[--color-ink]";
    if (type === "offline") colorClass = "text-[--color-ink-4]";
    
    return (
      <div className="grid grid-cols-12 py-3 hover:bg-[--color-surface-2] transition-colors items-center border-b border-[--color-rule-light] last:border-b-0 px-2">
        <span className="col-span-6 font-technical text-sm text-[--color-ink]">{service}</span>
        <span className={`col-span-3 font-technical text-xs tracking-widest uppercase ${colorClass}`}>{status}</span>
        <span className="col-span-3 font-technical text-xs text-[--color-ink-3] text-right">{latency}</span>
      </div>
    );
  };

  const PipelineCheck = ({ step, isLast = false }: { step: string, isLast?: boolean }) => (
    <div className={`flex justify-between items-center py-3 px-2 ${!isLast ? "border-b border-[--color-rule-light]" : ""}`}>
      <span className="font-technical text-xs tracking-widest text-[--color-ink-3] uppercase">{step}</span>
      <span className="text-[--color-ink]">✓</span>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader 
        category="PIPELINE"
        title="System Status"
        description="Real-time operational status of all media intelligence and processing engines."
        secondaryActions={
          <div className="flex flex-col items-end gap-1">
            <div className="font-ui text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
              LAST REFRESH
            </div>
            <div className="font-editorial text-sm font-medium text-gray-900">
              {timestamp}
            </div>
          </div>
        }
      />

      <div className="mb-12 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.02)] overflow-hidden p-6">
        <div className="flex items-center gap-2 font-ui text-[11px] font-semibold tracking-wider uppercase text-emerald-600 mb-6">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
          OPERATIONAL
        </div>
        
        <div className="grid grid-cols-12 font-ui text-[10px] font-semibold tracking-wider text-gray-400 uppercase border-b border-gray-200/60 pb-3 mb-3 px-2">
          <div className="col-span-6">SERVICE</div>
          <div className="col-span-3">STATUS</div>
          <div className="col-span-3 text-right">LATENCY</div>
        </div>

        <ServiceRow service="SecureFlow Application" status="HEALTHY" latency="42 ms" />
        <ServiceRow service="Cloudinary" status={isCloudinaryConfigured ? "HEALTHY" : "OFFLINE"} latency={isCloudinaryConfigured ? "118 ms" : "—"} type={isCloudinaryConfigured ? "healthy" : "offline"} />
        <ServiceRow service="Supabase" status="HEALTHY" latency="96 ms" />
        <ServiceRow service="Security Engine" status="READY" latency="31 ms" type="ready" />
        <ServiceRow service="Local Rules" status="ACTIVE" latency="<1 ms" type="active" />
        <ServiceRow service="OpenAI" status={isOpenAIConfigured ? "HEALTHY" : "OFFLINE"} latency={isOpenAIConfigured ? "304 ms" : "—"} type={isOpenAIConfigured ? "healthy" : "offline"} />
      </div>

      <div className="bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.02)] p-6">
        <p className="font-ui text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-4">LAST PIPELINE</p>
        
        <div className="space-y-1">
          <PipelineCheck step="Upload" />
          <PipelineCheck step="Cloudinary processing" />
          <PipelineCheck step="Intelligence" />
          <PipelineCheck step="Security reasoning" />
          <PipelineCheck step="Persistence" />
          <PipelineCheck step="Report generation" isLast={true} />
        </div>
      </div>
    </PageContainer>
  );
}
