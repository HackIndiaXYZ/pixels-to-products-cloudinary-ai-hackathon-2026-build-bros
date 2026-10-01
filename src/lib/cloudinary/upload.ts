import { cloudinary } from './config';
import type { SecurityEvidence } from './types';

export const FOLDER_BASE = "secureflow/security-evidence";

export async function uploadSecurityEvidence(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<SecurityEvidence> {
  const isVideo = mimeType.startsWith("video/");
  const isImage = mimeType.startsWith("image/");
  
  let resourceType: "image" | "video" | "raw" | "auto" = "auto";
  let folder = `${FOLDER_BASE}/misc`;

  if (isVideo) {
    resourceType = "video";
    folder = `${FOLDER_BASE}/videos`;
  } else if (isImage) {
    resourceType = "image";
    folder = `${FOLDER_BASE}/images`;
  } else if (mimeType === "application/pdf") {
    resourceType = "image"; 
    folder = `${FOLDER_BASE}/reports`;
  }

  // Use the explicit preset if defined, otherwise rely on the folder and global settings
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || undefined;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        upload_preset: uploadPreset,
        tags: ["secureflow", "security-evidence"],
        context: `analysis_status=uploaded|original_filename=${filename}`,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Failed to upload to Cloudinary"));
        } else {
          resolve({
            assetId: result.asset_id,
            publicId: result.public_id,
            secureUrl: result.secure_url,
            resourceType: result.resource_type as "image" | "video" | "raw" | "auto",
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
            duration: result.duration,
            createdAt: result.created_at,
            tags: result.tags || [],
            metadata: {
              analysis_status: "uploaded",
              original_filename: filename,
            },
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export async function getSecurityAsset(publicId: string) {
  return cloudinary.api.resource(publicId);
}

export async function deleteSecurityAsset(publicId: string, resourceType: "image" | "video" | "raw" = "image") {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export function generateOptimizedDeliveryUrl(publicId: string, options: Record<string, unknown> = {}) {
  return cloudinary.url(publicId, {
    fetch_format: "auto",
    quality: "auto",
    ...options
  });
}
