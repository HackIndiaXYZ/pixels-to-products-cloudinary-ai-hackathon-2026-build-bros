import { cloudinary } from "../config";

export async function runAutoTagging(publicId: string, resourceType: "image" | "video" | "raw" | "auto" = "image") {
  try {
    const result = await cloudinary.uploader.explicit(publicId, {
      type: "upload",
      resource_type: resourceType,
      categorization: "google_tagging",
      auto_tagging: 0.6 // minimum confidence threshold
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
        error: "Google Auto Tagging add-on is not enabled.",
        code: "ADDON_REQUIRED"
      };
    }
    return { success: false, error: msg, code: "API_ERROR" };
  }
}
