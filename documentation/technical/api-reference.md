# API Reference

SecureFlow AI exposes several internal API routes for communication between the frontend and the backend services. All routes are located under `/api/`.

## Media API

### `POST /api/media/upload`
Uploads a media asset to Cloudinary.
- **Request Body**: `FormData` containing the file under the key `file`.
- **Response**: Returns the Cloudinary upload response object, including `secure_url`, `public_id`, and extracted intelligence data.

### `POST /api/media/analyze`
Saves the initial evidence record to Supabase before security analysis.
- **Request Body**: JSON containing `url`, `publicId`, `filename`, `format`, `size`, `resourceType`.
- **Response**: Returns the newly created database record from the `evidence` table, including the generated `id`.

## Security API

### `POST /api/security/analyze`
Triggers the SecureFlow Rule Engine to evaluate the media asset.
- **Request Body**: JSON containing `assetId` (from `/api/media/analyze`), `publicId`, `resourceType`, and `cloudinaryIntelligence` (extracted tags, OCR, moderation).
- **Response**: Returns a comprehensive `SecurityAnalysisResult` including risk score, severity, observations, and potential risks.

## Status API

### `GET /api/health`
Checks the health of the underlying services (Supabase, Cloudinary, Engine).
- **Response**: Returns a JSON object with the status, latency, and sparkline data for each service.
