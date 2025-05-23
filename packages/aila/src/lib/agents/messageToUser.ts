import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import { aiLogger } from "@oakai/logger";

import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { type LooseLessonPlan } from "../../protocol/schema";
import { sectionGroups } from "./lessonPlanSectionGroups";
import { messageToUserInstructions } from "./prompts";

const log = aiLogger("aila:agents:prompts");

const responseSchema = z.object({
  message: z.string().describe("Message to the user"),
});

export type RouterResponse = z.infer<typeof responseSchema>;

export async function messageToUserAgent({
  chatId,
  userId,
  document,
  jsonDiff,
  messageHistoryChatOnly,
}: {
  chatId: string;
  userId: string;
  document: LooseLessonPlan;
  jsonDiff: string;
  messageHistoryChatOnly: { role: "user" | "assistant"; content: string }[];
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
    "message_to_user_response_schema",
  );

  const missingSections = sectionGroups
    .flat()
    .filter((sectionKey) => !document[sectionKey]);

  const input = JSON.stringify({
    currentDocument: document,
    jsonDiff,
    missingSections,
    messageHistoryChatOnly,
  });
  const instructions = messageToUserInstructions;

  log.info("messageToUserAgent input:", input);
  log.info("messageToUserAgent instructions:", instructions);

  const result = await openAIClient.responses.parse({
    instructions,
    input,
    stream: false,
    model: "gpt-4.1-2025-04-14",
    text: {
      format: responseFormat,
    },
  });

  return result.output_parsed;
}
