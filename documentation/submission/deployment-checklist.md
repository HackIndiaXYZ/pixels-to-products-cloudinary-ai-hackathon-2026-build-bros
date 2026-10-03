# Deployment Checklist

Follow this checklist to successfully deploy SecureFlow AI to a production environment (e.g., Vercel, Netlify).

## 1. Environment Variables
Ensure the following variables are configured in your deployment platform's environment settings:
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- [ ] `NEXT_PUBLIC_CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (if bypassing RLS in server actions)

## 2. Database Setup (Supabase)
- [ ] Ensure all tables (`evidence`, `analyses`) are created with the correct schema.
- [ ] Ensure Row Level Security (RLS) policies are configured correctly for authenticated users (or disabled if running a public demo).
- [ ] Verify foreign key constraints between `evidence` and `analyses`.

## 3. Cloudinary Configuration
- [ ] Verify the Upload Preset (`secureflow-upload` or similar) is created and set to Unsigned (or Signed, if implemented in backend).
- [ ] Ensure AI Add-ons are enabled in your Cloudinary account:
  - Google Auto Tagging
  - Cloudinary OCR
  - WebPurify Moderation

## 4. Build & Validation
- [ ] Run `npm run lint` locally and ensure 0 errors.
- [ ] Run `npm run build` locally and ensure it compiles successfully.
- [ ] Run `npx playwright test` to verify all end-to-end flows.

## 5. Post-Deployment Checks
- [ ] Verify media upload works on the deployed URL.
- [ ] Verify the security analysis completes and saves to Supabase.
- [ ] Verify the dashboard loads data correctly.
