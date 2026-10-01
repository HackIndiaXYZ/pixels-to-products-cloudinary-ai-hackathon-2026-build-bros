import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata = { title: "Configuration - SecureFlow AI" };

export default function ConfigurationPage() {
  const isCloudinaryConfigured = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const isCloudinaryUploadPreset = !!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;

  const ConfigSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-12">
      <p className="eyebrow mb-2">{title}</p>
      <hr className="rule-strong mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 font-technical text-sm tracking-widest uppercase text-[--color-ink]">
        {children}
      </div>
    </div>
  );

  const ConfigItem = ({ label, status, type = "configured" }: { label: string, status: string, type?: "configured" | "unconfigured" | "enabled" }) => {
    let colorClass = "text-[--color-ink]";
    let icon = "●";
    
    if (type === "unconfigured") {
      colorClass = "text-[--color-ink-4]";
      icon = "○";
    } else if (type === "enabled") {
      icon = "✓";
    }

    return (
      <div className="flex justify-between items-center border-b border-[--color-rule-light] pb-3">
        <span className="text-[--color-ink-3]">{label}</span>
        <div className={`flex items-center gap-2 ${colorClass}`}>
          <span>{icon}</span>
          <span>{status}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="px-8 lg:px-12 pt-8 pb-24 max-w-[1400px] mx-auto w-full">
      <Breadcrumbs items={[
        { label: "SYSTEM" },
        { label: "CONFIGURATION" }
      ]} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-[--color-rule] pb-6">
        <div>
          <h1 className="font-editorial text-3xl tracking-wide uppercase text-[--color-ink] mb-3">
            System Configuration
          </h1>
          <p className="font-ui text-sm text-[--color-ink-2] leading-relaxed">
            Provider settings, integrations, and environment controls.
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 text-right">
          <div className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-1">
            ENVIRONMENT
          </div>
          <div className="font-technical text-sm text-[--color-ink]">
            PRODUCTION ENV
          </div>
        </div>
      </div>

      <div className="border border-[--color-rule] bg-[--color-surface] p-8 lg:p-12">
        <ConfigSection title="CLOUDINARY">
          <ConfigItem label="Cloud Name" status={isCloudinaryConfigured ? "CONFIGURED" : "MISSING"} type={isCloudinaryConfigured ? "configured" : "unconfigured"} />
          <ConfigItem label="Upload Preset" status={isCloudinaryUploadPreset ? "CONFIGURED" : "MISSING"} type={isCloudinaryUploadPreset ? "configured" : "unconfigured"} />
          <ConfigItem label="API Connection" status={isCloudinaryConfigured ? "HEALTHY" : "OFFLINE"} type={isCloudinaryConfigured ? "configured" : "unconfigured"} />
          <ConfigItem label="Delivery" status={isCloudinaryConfigured ? "HEALTHY" : "OFFLINE"} type={isCloudinaryConfigured ? "configured" : "unconfigured"} />
        </ConfigSection>

        <ConfigSection title="SUPABASE">
          <ConfigItem label="Database" status={isSupabaseConfigured ? "CONNECTED" : "OFFLINE"} type={isSupabaseConfigured ? "configured" : "unconfigured"} />
          <ConfigItem label="Persistence" status={isSupabaseConfigured ? "HEALTHY" : "OFFLINE"} type={isSupabaseConfigured ? "configured" : "unconfigured"} />
          <ConfigItem label="RLS" status="DEMO MODE" />
        </ConfigSection>

        <ConfigSection title="SECURITY ENGINE">
          <ConfigItem label="OpenAI" status={isOpenAIConfigured ? "CONFIGURED" : "NOT CONFIGURED"} type={isOpenAIConfigured ? "configured" : "unconfigured"} />
          <ConfigItem label="Cloudinary AI" status={isCloudinaryConfigured ? "AVAILABLE" : "UNAVAILABLE"} />
          <ConfigItem label="Local Rules" status="ACTIVE" />
        </ConfigSection>

        <ConfigSection title="MEDIA DELIVERY">
          <ConfigItem label="Auto Format" status="f_auto" type="enabled" />
          <ConfigItem label="Auto Quality" status="q_auto" type="enabled" />
          <ConfigItem label="CDN Delivery" status="ENABLED" type="enabled" />
        </ConfigSection>
      </div>
      
      <p className="mt-8 font-technical text-[10px] text-[--color-ink-4] uppercase tracking-widest text-center">
        Note: Environment secrets and keys are explicitly excluded from this dashboard for security.
      </p>
    </div>
  );
}
