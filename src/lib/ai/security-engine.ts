import { generateOptimizedDeliveryUrl } from "../cloudinary/upload";
import { runOpenAIProvider } from "./providers/openai";
import { runCloudinaryProvider } from "./providers/cloudinary";
import { runLocalRulesProvider } from "./providers/local-rules";
import { SecurityAnalysisResult } from "./schemas";

export interface EnginePayload {
  assetId: string;
  publicId: string;
  resourceType: "image" | "video" | "raw" | "auto";
  cloudinaryIntelligence: Record<string, unknown>;
  userContext?: string;
}

export type AnalysisProvider = "openai" | "cloudinary" | "local-rules";

export async function runSecurityEngine(payload: EnginePayload): Promise<{ success: boolean; data: SecurityAnalysisResult; provider: AnalysisProvider }> {
  const { publicId, cloudinaryIntelligence } = payload;
  
  const optimizedUrl = generateOptimizedDeliveryUrl(publicId);
  
  // 1. Try OpenAI if key is present
  if (process.env.OPENAI_API_KEY) {
    try {
      const result = await runOpenAIProvider(payload, optimizedUrl);
      return { success: true, data: result, provider: "openai" };
    } catch (err: unknown) {
      console.warn("OpenAI Provider failed:", err instanceof Error ? err.message : String(err));
      // If the error is 429 (billing) or other API issue, fallback to Cloudinary.
      // But we will log it so the developer knows.
    }
  }

  // 2. Try Cloudinary AI if tags or moderation exist
  const tags = (cloudinaryIntelligence?.tags as string[]) || [];
  const moderation = cloudinaryIntelligence?.moderation as string | undefined;
  
  if (tags.length > 0 || (moderation && moderation !== "pending")) {
    const result = runCloudinaryProvider(payload);
    // Explicitly note the model as cloudinary
    result.model = "cloudinary_ai";
    return { success: true, data: result, provider: "cloudinary" };
  }

  // 3. Fallback to Local Deterministic Rules
  const result = runLocalRulesProvider(payload);
  result.model = "local_rules";
  return { success: true, data: result, provider: "local-rules" };
}
