import { AnalysisForm } from "@/components/analysis/AnalysisForm";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata = { title: "New Analysis" };

export default function NewAnalysisPage() {
  const year = new Date().getFullYear();
  const randomId = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  const analysisId = `SF-${year}-${randomId}`;

  return (
    <div className="px-8 lg:px-12 pt-8 pb-24 max-w-[1400px] mx-auto w-full">
      <Breadcrumbs items={[
        { label: "COMMAND CENTER" },
        { label: "NEW ANALYSIS" }
      ]} />

      {/* Heading */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-xl">
          <h1 className="font-editorial text-3xl tracking-wide uppercase text-[--color-ink] mb-3">
            New Security Analysis
          </h1>
          <p className="font-ui text-sm text-[--color-ink-2] leading-relaxed">
            Submit evidence for automated media intelligence and security assessment.
          </p>
        </div>
        <div className="text-right">
          <p className="font-technical text-[10px] tracking-widest text-[--color-ink-4] uppercase mb-1">ANALYSIS ID</p>
          <p className="font-technical text-sm text-[--color-ink]">{analysisId}</p>
        </div>
      </div>
      
      <hr className="rule-strong mb-10" />

      <div className="max-w-5xl mx-auto">
        <AnalysisForm />
      </div>
    </div>
  );
}
