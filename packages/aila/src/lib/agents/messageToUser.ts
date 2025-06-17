import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import { aiLogger } from "@oakai/logger";

import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { type LooseLessonPlan } from "../../protocol/schema";
import type { AgentName } from "./agents";
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
  error,
  routerDecision,
}: {
  chatId: string;
  userId: string;
  document: LooseLessonPlan;
  jsonDiff: string;
  messageHistoryChatOnly: { role: "user" | "assistant"; content: string }[];
  error?: {
    currentAgent: AgentName;
    message: string;
  };
  routerDecision?: {
    type: "end_turn";
    reason:
      | "out_of_scope"
      | "clarification_needed"
      | "ethical_concern"
      | "capability_limitation"
      | "task_complete";
    context: string;
  };
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

  const instructions = messageToUserInstructions;
  let input = JSON.stringify({
    currentDocument: document,
    jsonDiff,
    missingSections,
    messageHistoryChatOnly,
  });

  if (error) {
    input += `### 🚨 Error state\nThe current agent (${error.currentAgent}) has failed to complete. If there is a non-trivial jsonDiff, then some edits have been made to the document. It's most likely that the agent has failed because the user has made a request at odds with Aila's functionality. If so, construct a message explaining the issue to them. These are the details of the error from the agent:\n${error.message}`;
  }

  if (routerDecision) {
    input += `### 📍 Router Decision\nThe router has decided to end the turn with reason: ${routerDecision.reason}\nRouter context: ${routerDecision.context}\n\nBased on this router decision, craft an appropriate user-facing message that addresses their request appropriately.`;
  }

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
