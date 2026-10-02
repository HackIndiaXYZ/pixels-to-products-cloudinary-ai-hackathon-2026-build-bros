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
    
    // Persist analysis dummy record so it appears in the Evidence library
    const { data: anData, error: anError } = await supabase.from('analyses').insert({
      evidence_id: evData.id,
      detected_evidence_type: "Workspace Media",
      executive_summary: "Media processed via Workspace.",
      risk_score: 0,
      overall_severity: "low",
      risk_status: "safe",
      analysis_confidence: "high",
      model: "workspace",
      analysis_status: "completed"
    }).select('id').single();

    if (anError) throw new Error("Failed to persist analysis: " + anError.message);

    return NextResponse.json({
      success: true,
      analysisId: anData.id
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
