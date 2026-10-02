import { MediaWorkspaceStudio } from "./MediaWorkspace";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Media Workspace — SecureFlow AI",
  description: "Upload, inspect, transform, and optimize media assets with AI-powered Cloudinary processing.",
};

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "demo";
  const cloudinaryConfigured = !!(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  const sp = await searchParams;
  const initialTool = sp.tool as any;

  return (
    <PageContainer>
      <PageHeader 
        category="COMMAND CENTER"
        title="Media Intelligence Workspace"
        description="Upload media, run AI analysis (auto-tagging, captioning, moderation), then apply Smart Crop, Background Removal, Optimization, and Transformations."
      />
      
      <MediaWorkspaceStudio 
        cloudName={cloudName} 
        cloudinaryConfigured={cloudinaryConfigured} 
        initialTool={initialTool}
      />
    </PageContainer>
  );
}
