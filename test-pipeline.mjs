import fs from 'fs';

async function run() {
  console.log("1. Uploading...");
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

  const basePayload = { assetId: asset.assetId, publicId: asset.publicId, resourceType: asset.resourceType };

  console.log("\n2. AI Vision...");
  const visRes = await fetch("http://localhost:3000/api/media/analyze", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...basePayload, action: "vision" })
  });
  console.log(await visRes.json());

  console.log("\n3. Tagging...");
  const tagRes = await fetch("http://localhost:3000/api/media/analyze", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...basePayload, action: "tagging" })
  });
  console.log(await tagRes.json());

  console.log("\n4. Moderation...");
  const modRes = await fetch("http://localhost:3000/api/media/analyze", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...basePayload, action: "moderation" })
  });
  console.log(await modRes.json());
}

run().catch(console.error);
