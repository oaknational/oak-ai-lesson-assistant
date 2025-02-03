import OpenAI from "openai";
import { z } from "zod";

import type { ImageCycle } from "../router/imageGen";

export interface ValidationResult {
  isValid: boolean;
  metadata: {
    imageContent: string;
    promptUsed: string;
    appropriatenessScore: number;
    validationReasoning: string;
  };
}

function isTheImageBase64(url: string) {
  const base64Regex = /^data:image\/(png|jpe?g|gif);base64,/;
  if (base64Regex.test(url)) {
    return `f"data:image/jpeg;base64,${url}`;
  }
  return url;
}

export async function validateImageWithOpenAI(
  imageUrl: string,
  prompt: string,
  lessonTitle: string,
  keyStage: string,
  subject: string,
  cycleInfo: ImageCycle | null,
): Promise<ValidationResult> {
  console.log(`[OpenAI Validation] Starting validation for image: ${imageUrl}`);
  console.log(`[OpenAI Validation] Prompt: ${prompt}`);

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.HELICONE_EU_HOST,
    });

    console.log("[OpenAI Validation] Sending request to OpenAI");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",

          content:
            "You are an image validator assessing if images are suitable for a classroom setting. " +
            "You should assess whether the image is appropriate given the prompt and the context of the lesson. Images should not have symbols or text on them" +
            "Always return your output as strict JSON. Do not include any additional text outside the JSON format. " +
            "The JSON should have the following structure:\n" +
            `{
                            "imageContent": "Description of the image content",
                            "prompt": "The provided prompt",
                            "validationReasoning": "Start by listing various image examples that could be used to match this prompt. Then describe exactly what is in this image. Finally provide reasoning for or against why this image is suitable for the prompt according to your own reasoning. And finally give it a relevance score. Feel free to be strict.",
                            "appropriatenessScore": 1-10,
                            "valid": true or false
                        }`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Prompt: "${prompt}"\n Lesson Title: "${lessonTitle}\n keyStage: "${keyStage}" \n subject: "${subject}" Analyze this image and determine if it's suitable.`,
            },
            {
              type: "image_url",
              image_url: {
                url: isTheImageBase64(imageUrl),
              },
            },
          ],
        },
      ],
      temperature: 0.2,
    });

    const fullResponse = response?.choices?.[0]?.message?.content?.trim() || "";
    console.log(
      `[OpenAI Validation] Full validation response:\n${fullResponse}`,
    );

    const jsonStart = fullResponse.indexOf("{");
    const jsonEnd = fullResponse.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error(
        "[OpenAI Validation] Response does not contain valid JSON.",
      );
    }
    const jsonResponse = fullResponse.slice(jsonStart, jsonEnd + 1);
    const responseSchema = z.object({
      imageContent: z.string().optional(),
      prompt: z.string().optional(),
      appropriatenessScore: z.number().optional(),
      validationReasoning: z.string().optional(),
      valid: z.boolean().optional(),
    });
    const validMatch = responseSchema.parse(JSON.parse(jsonResponse));

    return {
      isValid: validMatch.valid || false,
      metadata: {
        imageContent: validMatch.imageContent || "",
        promptUsed: prompt,
        appropriatenessScore: validMatch.appropriatenessScore || 0,
        validationReasoning: validMatch.validationReasoning || "",
      },
    };
  } catch (error) {
    console.error("[OpenAI Validation] Error during validation:", error);
    throw new Error(`[OpenAI Validation] Validation failed: ${error}`);
  }
}
