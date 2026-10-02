import { AnalysisForm } from "@/components/analysis/AnalysisForm";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = { title: "New Analysis" };

export default function NewAnalysisPage() {
  const year = new Date().getFullYear();
  const randomId = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  const analysisId = `SF-${year}-${randomId}`;

  return (
    <PageContainer>
      <PageHeader 
        category="COMMAND CENTER"
        title="New Security Analysis"
        description="Submit evidence for automated media intelligence and security assessment."
        secondaryActions={
          <div className="flex flex-col items-end gap-1">
            <p className="font-ui text-[10px] font-semibold tracking-wider text-gray-500 uppercase">ANALYSIS ID</p>
            <p className="font-editorial text-sm font-medium text-gray-900">{analysisId}</p>
          </div>
        }
      />

      <div className="max-w-5xl mx-auto">
        <AnalysisForm />
      </div>
    </PageContainer>
  );
}
