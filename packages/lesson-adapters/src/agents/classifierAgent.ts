import { openai } from "@ai-sdk/openai";
import { Output, generateText } from "ai";
import { z } from "zod";

export const intentSchema = z.object({
  intent: z.enum([
    "changeReadingAge",
    "translateLesson",
    "deleteSlide",
    "editSlideText",
    "removeKLP",
    "other",
  ]),
  reasoning: z
    .string()
    .describe("Brief explanation of why this intent was identified"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence level in the classification (0-1)"),
});

const SYSTEM_PROMPT = `You are a classifier agent that identifies user intent for lesson adaptation tasks.

Your role is to analyze user requests and classify them into specific intent categories related to modifying educational lessons.

Intent Categories:
- changeReadingAge: User wants to adjust the reading age/difficulty level of the content
- deleteSlide: User wants to remove one or more slides from the lesson
- editSlideText: User wants to modify text, images, or other content on existing slides
- removeKLP: User wants to remove a key learning point from the lesson
- translateLesson: User wants to translate the lesson content into another language, must include target language
Guidelines:
- Be specific in your classification
- Provide high confidence (0.8+) only when the intent is clear
- If multiple intents are present, choose the primary one
- Use "other" sparingly and provide detailed reasoning`;

export async function classifyLessonAdaptIntent(
  userPrompt: string,
): Promise<LessonAdaptIntent> {
  const { output } = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: intentSchema }),
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
  });

  return output;
}

export type LessonAdaptIntent = z.infer<typeof intentSchema>;
