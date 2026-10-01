import { cloudinary } from "../config";

export async function runAIVision(publicId: string, resourceType: "image" | "video" | "raw" | "auto" = "image") {
  try {
    // Cloudinary AI Vision API integration.
    // In many SDK versions, AI capabilities are invoked via the detection or categorization parameters,
    // or through the newer Analyze API if available.
    // We will attempt a standard advanced detection call.
    const result = await cloudinary.uploader.explicit(publicId, {
      type: "upload",
      resource_type: resourceType,
      detection: "captioning" // fallback/standard vision capability
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("not allowed") || msg.includes("add-on") || msg.includes("must be enabled")) {
      return { 
        success: false, 
        error: "Cloudinary AI Vision add-on is not enabled for this account.",
        code: "ADDON_REQUIRED"
      };
    }
    return { success: false, error: msg, code: "API_ERROR" };
  }
}
