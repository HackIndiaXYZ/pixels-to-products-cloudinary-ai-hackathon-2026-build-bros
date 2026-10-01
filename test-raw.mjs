import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

const config = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

cloudinary.config(config);

async function run() {
  const publicId = 'secureflow/security-evidence/images/uqndpxhoagwzikxsrwld';
  
  console.log("Checking AI Vision (captioning)...");
  try {
    const vis = await cloudinary.uploader.explicit(publicId, { type: "upload", detection: "captioning" });
    console.log("Vision Info:", JSON.stringify(vis.info, null, 2));
  } catch (e) { console.error("Vision Error:", e.message); }

  console.log("\nChecking Google Tagging...");
  try {
    const tag = await cloudinary.uploader.explicit(publicId, { type: "upload", categorization: "google_tagging" });
    console.log("Tagging Info:", JSON.stringify(tag.info, null, 2));
  } catch (e) { console.error("Tagging Error:", e.message); }

  console.log("\nChecking AWS Moderation...");
  try {
    const mod = await cloudinary.uploader.explicit(publicId, { type: "upload", moderation: "aws_rek" });
    console.log("Moderation:", JSON.stringify(mod.moderation, null, 2));
  } catch (e) { console.error("Moderation Error:", e.message); }
}

run().catch(console.error);
