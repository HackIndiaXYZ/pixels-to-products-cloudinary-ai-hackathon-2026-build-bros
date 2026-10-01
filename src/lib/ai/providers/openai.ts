import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { SecurityAnalysisResultSchema } from "../schemas";
import { SECURITY_ANALYSIS_PROMPT } from "../prompts";
import { EnginePayload } from "../security-engine";

const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function runOpenAIProvider(
  payload: EnginePayload,
  optimizedUrl: string
) {
  const { cloudinaryIntelligence, userContext } = payload;
  const contextMessage = `
Cloudinary Intelligence:
${JSON.stringify(cloudinaryIntelligence, null, 2)}

User Context:
${userContext || "None provided."}
  `;

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SECURITY_ANALYSIS_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: `Please analyze the following security evidence:\n${contextMessage}` },
          { type: "image_url", image_url: { url: optimizedUrl } }
        ]
      }
    ],
    response_format: zodResponseFormat(SecurityAnalysisResultSchema, "security_analysis_result"),
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("OpenAI returned empty response");
  
  const parsed = JSON.parse(content);
  parsed.model = "gpt-4o";
  return parsed;
}
