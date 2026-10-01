import { v2 as cloudinary } from 'cloudinary';

const config = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

if (!config.cloud_name || !config.api_key || !config.api_secret) {
  console.warn("⚠️ Cloudinary credentials are not fully configured in environment variables.");
}

cloudinary.config(config);

export { cloudinary };
