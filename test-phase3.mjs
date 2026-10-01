import fs from 'fs';

async function run() {
  console.log("1. Uploading image to Cloudinary...");
  const formData = new FormData();
  const fileBuffer = fs.readFileSync('C:\\Users\\Amruth\\.gemini\\antigravity-ide\\brain\\139818b2-c965-4f5a-9a1f-e07736c99b89\\security_dashboard_test_1790795383337.jpg');
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
  formData.append('file', blob, 'test.jpg');

  const uploadRes = await fetch("http://localhost:3000/api/media/upload", {
    method: "POST",
    body: formData
  });
  const uploadData = await uploadRes.json();
  if (!uploadData.success) {
    console.error("Upload failed", uploadData);
    return;
  }
  const asset = uploadData.asset;
  console.log("Asset Uploaded:", asset.publicId);

  const payload = { 
    evidence: {
      assetId: asset.assetId, 
      publicId: asset.publicId, 
      secureUrl: asset.secureUrl,
      resourceType: asset.resourceType,
      format: asset.format,
      width: asset.width,
      height: asset.height,
      bytes: asset.bytes
    },
    cloudinaryIntelligence: {
      tags: [],
      moderation: "pending",
      diagnostics: { vision: "ADDON_REQUIRED" }
    },
    userContext: "Testing Phase 3 OpenAI Security Reasoning Engine"
  };

  console.log("\n2. Executing Security Reasoning Engine (OpenAI Vision)...");
  const analyzeRes = await fetch("http://localhost:3000/api/security/analyze", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const analyzeData = await analyzeRes.json();
  
  if (!analyzeData.success) {
    console.error("Security Reasoning failed:", analyzeData);
    return;
  }
  
  console.log("\n--- SECURITY ANALYSIS RESULT ---");
  console.log(JSON.stringify(analyzeData.analysis, null, 2));
}

run().catch(console.error);
