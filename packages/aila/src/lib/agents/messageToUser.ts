import { createOpenAIClient } from "@oakai/core/src/llm/openai";

import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { type LooseLessonPlan } from "../../protocol/schema";
import { sectionGroups } from "./lessonPlanSectionGroups";
import { messageToUserInstructions } from "./prompts";

const responseSchema = z.object({
  message: z.string().describe("Message to the user"),
});

export type RouterResponse = z.infer<typeof responseSchema>;

export async function messageToUserAgent({
  chatId,
  userId,
  document,
  jsonDiff,
  messageHistory,
}: {
  chatId: string;
  userId: string;
  document: LooseLessonPlan;
  jsonDiff: string;
  messageHistory: { role: "user" | "assistant"; content: string }[];
}): Promise<RouterResponse | null> {
  const openAIClient = createOpenAIClient({
    app: "lesson-assistant",
    chatMeta: {
      chatId,
      userId,
    },
  });

  const responseFormat = zodTextFormat(
    responseSchema,
    "router_response_schema",
  );

  const missingSections = sectionGroups
    .flat()
    .filter((sectionKey) => !document[sectionKey]);

  const input = JSON.stringify({
    currentDocument: document,
    jsonDiff,
    missingSections,
    messageHistory,
  });

  const result = await openAIClient.responses.parse({
    instructions: messageToUserInstructions,
    input,
    stream: false,
    model: "gpt-4.1-2025-04-14",
    text: {
      format: responseFormat,
    },
  });

  return result.output_parsed;
}
