import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { SecurityAnalysisResultSchema } from "./schemas";
import { SECURITY_ANALYSIS_PROMPT } from "./prompts";

const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeSecurityEvidence(
  mediaUrl: string, 
  cloudinaryIntelligence: Record<string, unknown>,
  userContext?: string
) {
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
          { type: "image_url", image_url: { url: mediaUrl } }
        ]
      }
    ],
    response_format: zodResponseFormat(SecurityAnalysisResultSchema, "security_analysis_result"),
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("OpenAI returned empty response");
  
  return JSON.parse(content);
}
