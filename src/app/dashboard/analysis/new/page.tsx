import { AnalysisProvider } from "@/components/analysis/AnalysisContext";
import { AnalysisStudioLayout } from "@/components/analysis/AnalysisComponents";

export const metadata = { title: "New Analysis" };

export default function NewAnalysisPage() {
  return (
    <AnalysisProvider>
      <AnalysisStudioLayout />
    </AnalysisProvider>
  );
}
