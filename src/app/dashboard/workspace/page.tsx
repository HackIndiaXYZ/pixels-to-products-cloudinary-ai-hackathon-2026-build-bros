import { MediaWorkspaceStudio } from "./MediaWorkspace";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Media Workspace — SecureFlow AI",
  description: "Upload, inspect, transform, and optimize media assets with AI-powered Cloudinary processing.",
};

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
    <div className="max-w-[1600px] mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[--color-ink-4]">
              Media Workspace
            </p>
          </div>
          <h1 className="text-2xl font-bold text-[--color-ink] mb-1">
            Media Intelligence Workspace
          </h1>
          <p className="text-sm text-[--color-ink-3] max-w-2xl">
            Upload media, run AI analysis (auto-tagging, captioning, moderation), then apply
            Smart Crop, Background Removal, Optimization, and Transformations — all powered
            by real Cloudinary operations. Copy the delivery URL or save to your Media Library.
          </p>
        </div>
      </div>

      <MediaWorkspaceStudio 
        cloudName={cloudName} 
        cloudinaryConfigured={cloudinaryConfigured} 
        initialTool={initialTool}
      />
    </div>
  );
}
