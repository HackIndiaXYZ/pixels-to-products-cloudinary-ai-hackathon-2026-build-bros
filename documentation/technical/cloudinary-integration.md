# Cloudinary Integration

Cloudinary is a foundational pillar of the SecureFlow AI architecture. We utilize it not just for storage, but as our primary AI extraction engine.

## Media Storage & Transformation

- All uploaded assets are securely stored in a dedicated Cloudinary environment.
- The **Transform Studio** utilizes Cloudinary's URL-based transformation API to allow users to preview modifications (crop, blur, background removal) in real-time before analysis.

## AI Intelligence Add-ons

SecureFlow AI deeply integrates three primary Cloudinary Add-ons to bypass the need for external LLMs:

### 1. Google Auto Tagging
- **Function**: Automatically analyzes images and returns categorized tags with confidence scores.
- **Usage in SecureFlow**: The local rule engine scans these tags for security-relevant keywords (e.g., "credit card", "document", "weapon").

### 2. Cloudinary OCR
- **Function**: Extracts text from images and documents.
- **Usage in SecureFlow**: The extracted text string is scanned by the local rule engine using RegEx patterns to identify API keys, passwords, emails, and PII.

### 3. WebPurify Content Moderation
- **Function**: Evaluates images for inappropriate, explicit, or NSFW content.
- **Usage in SecureFlow**: The moderation status (approved, pending, rejected) is fed into the rule engine. Rejected content triggers an automatic High or Critical severity finding.

## Implementation Details

Uploads are handled via the Cloudinary Node.js SDK in the `/api/media/upload` route. We explicitly request the add-ons during the upload call:

```javascript
const uploadResult = await cloudinary.uploader.upload(fileUri, {
    upload_preset: "secureflow",
    categorization: "google_tagging",
    ocr: "adv_ocr",
    moderation: "webpurify"
});
```
