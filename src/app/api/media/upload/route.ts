import { NextResponse } from "next/server";
import { uploadSecurityEvidence } from "@/lib/cloudinary/upload";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "application/pdf",
]);

const ALLOWED_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "webp", "gif", "mp4", "mov", "webm", "pdf"
]);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Size validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Name and Extension validation
    const filename = file.name;
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { success: false, error: "Unsupported file extension" },
        { status: 400 }
      );
    }

    // Mime type validation (client-provided, but we check anyway)
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: "Unsupported MIME type" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Basic magic byte check for images to prevent completely disguised files
    // (This is a rudimentary check, Cloudinary will also validate on their end)
    const header = buffer.subarray(0, 4).toString("hex");
    let isMagicValid = false;
    
    if (ext === "jpg" || ext === "jpeg") isMagicValid = header.startsWith("ffd8");
    else if (ext === "png") isMagicValid = header === "89504e47";
    else if (ext === "gif") isMagicValid = header.startsWith("47494638");
    else if (ext === "webp") isMagicValid = buffer.subarray(8, 12).toString("hex") === "57454250"; // RIFF....WEBP
    else if (ext === "pdf") isMagicValid = header === "25504446"; // %PDF
    else isMagicValid = true; // For videos, we'll let Cloudinary handle deep inspection for now

    if (!isMagicValid) {
      return NextResponse.json(
        { success: false, error: "File content does not match extension" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const asset = await uploadSecurityEvidence(buffer, filename, file.type);

    return NextResponse.json({
      success: true,
      asset,
    });
  } catch (error) {
    console.error("Media upload error:", error);
    // Generic error response to avoid leaking internal details
    return NextResponse.json(
      { success: false, error: "Failed to process media upload" },
      { status: 500 }
    );
  }
}
