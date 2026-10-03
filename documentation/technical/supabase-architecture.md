# Supabase Architecture

SecureFlow AI uses Supabase as its primary database and authentication provider.

## Database Schema

The database consists of two primary tables:

### 1. `evidence`
Stores the metadata for uploaded media assets.
- `id` (UUID, Primary Key)
- `created_at` (Timestamp)
- `filename` (String)
- `url` (String - Cloudinary Secure URL)
- `public_id` (String - Cloudinary Public ID)
- `format` (String)
- `size` (Integer)
- `resource_type` (String)

### 2. `analyses`
Stores the generated security reports.
- `id` (UUID, Primary Key)
- `evidence_id` (UUID, Foreign Key -> `evidence.id`)
- `created_at` (Timestamp)
- `risk_score` (Integer)
- `risk_status` (String - e.g., 'investigating', 'resolved')
- `overall_severity` (String)
- `detected_evidence_type` (String)
- `executive_summary` (String)
- `observations` (JSONB Array)
- `potential_risks` (JSONB Array)
- `recommendations` (JSONB Array)

## Data Access Strategy

- **Server-Side Access**: The application primarily interacts with Supabase via Server Actions and Server Components using the `@supabase/ssr` package. This ensures secure, backend-only database queries.
- **Proxy Layer**: A `src/proxy.ts` layer exists to abstract Supabase client creation and provide a centralized point for managing database connections across the Next.js app.
- **Row Level Security (RLS)**: Policies are defined on the tables to ensure users can only access `evidence` and `analyses` records that belong to them (via a `user_id` column, if authentication is fully implemented).
