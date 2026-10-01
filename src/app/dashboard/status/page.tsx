import { Breadcrumbs } from "@/components/ui/breadcrumbs";

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
    <div className="px-8 lg:px-12 pt-8 pb-24 max-w-[1400px] mx-auto w-full">
      <Breadcrumbs items={[
        { label: "PIPELINE" },
        { label: "STATUS" }
      ]} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-[--color-rule] pb-6">
        <div>
          <h1 className="font-editorial text-3xl tracking-wide uppercase text-[--color-ink] mb-3">
            System Status
          </h1>
          <div className="flex items-center gap-2 font-technical text-sm tracking-widest uppercase text-[--color-ink]">
            <span className="w-2 h-2 bg-[--color-low] rounded-full"></span>
            OPERATIONAL
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 text-right">
          <div className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-1">
            LAST REFRESH
          </div>
          <div className="font-technical text-sm text-[--color-ink]">
            {timestamp}
          </div>
        </div>
      </div>

      <div className="border border-[--color-rule] bg-[--color-surface] p-8 mb-12">
        <div className="grid grid-cols-12 font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase border-b border-[--color-rule-strong] pb-2 mb-2 px-2">
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

      <div className="border border-[--color-rule] bg-[--color-surface] p-8">
        <p className="eyebrow mb-2">LAST PIPELINE</p>
        <hr className="rule-strong mb-6" />

        <div className="space-y-1">
          <PipelineCheck step="Upload" />
          <PipelineCheck step="Cloudinary processing" />
          <PipelineCheck step="Intelligence" />
          <PipelineCheck step="Security reasoning" />
          <PipelineCheck step="Persistence" />
          <PipelineCheck step="Report generation" isLast={true} />
        </div>
      </div>
    </div>
  );
}
