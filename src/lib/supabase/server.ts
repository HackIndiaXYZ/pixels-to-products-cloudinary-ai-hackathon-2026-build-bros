import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ─── Config Error ─────────────────────────────────────────────────────────────
// Thrown when a required server-side env var is missing or is still the default placeholder.
export class ConfigurationError extends Error {
  public readonly stage: string;
  public readonly code: string;
  public readonly retryable: boolean;

  constructor(message: string, stage: string, code: string, retryable = false) {
    super(message);
    this.name = "ConfigurationError";
    this.stage = stage;
    this.code = code;
    this.retryable = retryable;
  }
}

// ─── Anon client (browser-safe, respects RLS) ────────────────────────────────
export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new ConfigurationError(
      "Supabase URL or anon key is not configured.",
      "supabase_client",
      "SUPABASE_CONFIG_MISSING"
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server component — can't set cookies; handled by middleware
        }
      },
    },
  });
}

// ─── Admin client (server-only, bypasses RLS) ────────────────────────────────
// Requires SUPABASE_SERVICE_ROLE_KEY.
// NEVER expose this client or its key to the browser.
export async function createAdminClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Detect missing or placeholder key BEFORE making any network call to Supabase,
  // so the error is immediately actionable.
  if (!url) {
    throw new ConfigurationError(
      "NEXT_PUBLIC_SUPABASE_URL is not set.",
      "evidence_persistence",
      "SUPABASE_URL_MISSING"
    );
  }

  if (
    !serviceRoleKey ||
    serviceRoleKey === "YOUR_ROTATED_SERVICE_ROLE_KEY_HERE" ||
    serviceRoleKey.trim() === ""
  ) {
    throw new ConfigurationError(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. " +
        "Please add your Supabase service role key to .env.local and restart the dev server. " +
        "Find it at: Project Settings → API → service_role (secret).",
      "evidence_persistence",
      "SUPABASE_SERVICE_ROLE_KEY_MISSING",
      false // not retryable without fixing the config
    );
  }

  return createServerClient(url, serviceRoleKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server component — can't set cookies; handled by middleware
        }
      },
    },
  });
}
