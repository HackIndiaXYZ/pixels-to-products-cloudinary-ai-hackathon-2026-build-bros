import { cloudinary } from "../config";

export async function updateAssetMetadata(
  publicId: string,
  resourceType: "image" | "video" | "raw" | "auto" = "image",
  context: Record<string, string>
) {
  try {
    const contextString = Object.entries(context)
      .map(([k, v]) => `${k}=${v}`)
      .join("|");

    const result = await cloudinary.uploader.explicit(publicId, {
      type: "upload",
      resource_type: resourceType,
      context: contextString
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg || "Failed to update metadata", code: "API_ERROR" };
  }
}
