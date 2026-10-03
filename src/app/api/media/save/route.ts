import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { asset, intel, transform, deliveryUrl } = body;

    if (!asset?.publicId || !asset?.assetId) {
      return NextResponse.json(
        { success: false, error: "Missing required asset details" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Persist evidence with the transformed URL and properties if needed,
    // or just the original evidence and we keep the transformed URL somewhere.
    // We'll save the transformed delivery URL as the secure_url so it shows in the library.
    const { data: evData, error: evError } = await supabase.from('evidence').insert({
      cloudinary_asset_id: asset.assetId,
      public_id: asset.publicId,
      secure_url: deliveryUrl || asset.secureUrl,
      resource_type: asset.resourceType,
      format: asset.format,
      width: asset.width,
      height: asset.height,
      bytes: asset.bytes
    }).select('id').single();

    if (evError) throw new Error("Failed to persist evidence: " + evError.message);
    
    return NextResponse.json({
      success: true,
      evidenceId: evData.id
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Workspace save error:", error);
    return NextResponse.json(
      { success: false, error: msg || "Failed to save media" },
      { status: 500 }
    );
  }
}
