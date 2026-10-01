import { NextResponse } from "next/server";
import { runAIVision } from "@/lib/cloudinary/ai/analysis";
import { runAutoTagging } from "@/lib/cloudinary/ai/tagging";
import { runModeration } from "@/lib/cloudinary/ai/moderation";
import { updateAssetMetadata } from "@/lib/cloudinary/ai/metadata";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { assetId, publicId, resourceType, action } = body;

    if (!publicId || !assetId) {
      return NextResponse.json({ success: false, error: "Missing required asset identifiers" }, { status: 400 });
    }

    if (action === "vision") {
      const result = await runAIVision(publicId, resourceType);
      let detectedContent = null;
      if (result.success && result.data?.info?.detection?.captioning?.data?.caption) {
        detectedContent = result.data.info.detection.captioning.data.caption;
      }
      return NextResponse.json({ success: true, detectedContent, diagnostics: result.success ? "OK" : result.error });
    }
    
    if (action === "tagging") {
      const result = await runAutoTagging(publicId, resourceType);
      let tags: string[] = [];
      if (result.success && result.data?.tags) tags = result.data.tags;
      return NextResponse.json({ success: true, tags, diagnostics: result.success ? "OK" : result.error });
    }
    
    if (action === "moderation") {
      const result = await runModeration(publicId, resourceType);
      let moderationState = "pending";
      if (result.success && result.data?.moderation?.[0]) {
        moderationState = result.data.moderation[0].status;
      } else if (result.code === "ADDON_REQUIRED") {
        moderationState = "addon_required";
      }
      return NextResponse.json({ success: true, moderation: moderationState, diagnostics: result.success ? "OK" : result.error });
    }

    if (action === "metadata") {
      const { visionSuccess, taggingSuccess, moderationState } = body;
      const result = await updateAssetMetadata(publicId, resourceType, {
        analysis_status: "completed",
        ai_vision_status: visionSuccess ? "completed" : "failed",
        tagging_status: taggingSuccess ? "completed" : "failed",
        moderation_status: moderationState || "unknown",
      });
      return NextResponse.json({ success: true, metadata: result.success ? result.data?.context?.custom : null });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error(`Media analysis error:`, error);
    return NextResponse.json({ success: false, error: "Failed to process media pipeline" }, { status: 500 });
  }
}
