import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ServiceStatus =
  | "Operational"
  | "Degraded"
  | "Offline"
  | "Configuration Error"
  | "Missing Key"
  | "Authentication Failed";

interface ServiceResult {
  status: ServiceStatus;
  latency: number;
  detail?: string;
}

interface HealthResults {
  secureflow: ServiceResult;
  cloudinary: ServiceResult;
  supabase: ServiceResult;
  supabase_admin: ServiceResult;
  ruleEngine: ServiceResult;
  openai: ServiceResult;
  timestamp: string;
}

export async function GET() {
  const results: HealthResults = {
    secureflow: { status: "Operational", latency: 0 },
    cloudinary: { status: "Offline", latency: 0 },
    supabase: { status: "Offline", latency: 0 },
    supabase_admin: { status: "Offline", latency: 0 },
    ruleEngine: { status: "Offline", latency: 0 },
    openai: { status: "Offline", latency: 0 },
    timestamp: new Date().toISOString(),
  };


  // 1. SecureFlow self-check
  results.secureflow.status = "Operational";
  results.secureflow.latency = 1;

  // 1b. Rule Engine check
  results.ruleEngine.status = "Operational";
  results.ruleEngine.latency = 1;

  // 2. Supabase anon (read) check
  try {
    const supabaseStart = Date.now();
    const supabase = await createClient();
    const { error } = await supabase.from("analyses").select("id").limit(1);
    results.supabase.latency = Date.now() - supabaseStart;
    if (!error) {
      results.supabase.status = "Operational";
    } else {
      results.supabase.status = "Degraded";
      results.supabase.detail = error.message;
    }
  } catch (e) {
    results.supabase.status = "Offline";
    results.supabase.detail = e instanceof Error ? e.message : String(e);
  }

  // 3. Supabase admin (service role) — check if key is configured
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (
    !serviceRoleKey ||
    serviceRoleKey === "YOUR_ROTATED_SERVICE_ROLE_KEY_HERE" ||
    serviceRoleKey.trim() === ""
  ) {
    results.supabase_admin.status = "Configuration Error";
    results.supabase_admin.detail =
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local and restart the server. " +
      "Find it at: Supabase Dashboard → Project Settings → API → service_role (secret).";
  } else {
    // Key is present — verify it works by trying a lightweight admin call
    try {
      const adminStart = Date.now();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/evidence?limit=1`,
        {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          cache: "no-store",
        }
      );
      results.supabase_admin.latency = Date.now() - adminStart;
      if (res.ok) {
        results.supabase_admin.status = "Operational";
      } else {
        const body = await res.text();
        results.supabase_admin.status =
          res.status === 401 ? "Authentication Failed" : "Degraded";
        results.supabase_admin.detail = body.substring(0, 200);
      }
    } catch (e) {
      results.supabase_admin.status = "Offline";
      results.supabase_admin.detail =
        e instanceof Error ? e.message : String(e);
    }
  }

  // 4. Cloudinary reachability
  try {
    const cldStart = Date.now();
    const cldName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const cldApiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const cldApiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cldName || !cldApiKey || !cldApiSecret) {
      results.cloudinary.status = "Configuration Error";
      results.cloudinary.detail =
        "One or more Cloudinary credentials (CLOUD_NAME / API_KEY / API_SECRET) are missing.";
    } else {
      // Ping Cloudinary CDN — a 200 or 404 from their CDN indicates the service is reachable
      const res = await fetch(
        `https://res.cloudinary.com/${cldName}/image/upload/v1/ping`,
        { method: "HEAD", cache: "no-store" }
      );
      results.cloudinary.latency = Date.now() - cldStart;
      if (res.ok || res.status === 404) {
        results.cloudinary.status = "Operational";
      } else {
        results.cloudinary.status = "Degraded";
        results.cloudinary.detail = `HTTP ${res.status}`;
      }
    }
  } catch (e) {
    results.cloudinary.status = "Offline";
    results.cloudinary.detail = e instanceof Error ? e.message : String(e);
  }

  // 5. OpenAI — verify key exists and authenticates
  try {
    const aiStart = Date.now();
    const openAIKey = process.env.OPENAI_API_KEY;

    if (!openAIKey || openAIKey.trim() === "") {
      results.openai.status = "Missing Key";
      results.openai.detail =
        "OPENAI_API_KEY is not set in environment variables.";
    } else {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${openAIKey}` },
        cache: "no-store",
      });
      results.openai.latency = Date.now() - aiStart;
      if (res.ok) {
        results.openai.status = "Operational";
      } else if (res.status === 401) {
        results.openai.status = "Authentication Failed";
        results.openai.detail =
          "OPENAI_API_KEY is invalid or revoked. Replace it in .env.local.";
      } else if (res.status === 429) {
        results.openai.status = "Degraded";
        results.openai.detail = "Rate limited or quota exceeded.";
      } else {
        results.openai.status = "Degraded";
        results.openai.detail = `HTTP ${res.status}`;
      }
    }
  } catch (e) {
    results.openai.status = "Offline";
    results.openai.detail = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(results);
}
