import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import { aiLogger } from "@oakai/logger";

import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { type LooseLessonPlan } from "../../protocol/schema";
import { sectionKeysSchema } from "./lessonPlanSectionGroups";
import { routerInstructions } from "./prompts";
import { identity } from "./prompts/shared/identity";

const log = aiLogger("aila:agents:prompts");

const responseSchema = z.object({
  result: z.union([
    z.object({
      type: z.literal("turn_plan"),
      plan: z.array(
        z.object({
          sectionKey: sectionKeysSchema,
          action: z.enum(["add", "replace", "delete"]),
          context: z
            .string()
            .describe(
              "Explicit guidance notes for downstream agent if applicable, otherwise empty string. User AGENT_TO_AGENT voice.",
            ),
        }),
      ),
    }),
    z.object({
      type: z.literal("end_turn"),
      reason: z
        .enum([
          "out_of_scope", // Request is completely unrelated to lesson planning
          "clarification_needed", // Request is ambiguous or unclear
          "ethical_concern", // Request violates content policies
          "capability_limitation", // Request is lesson-related but technically impossible
          "task_complete", // Lesson is finished and user seems satisfied
        ])
        .describe("The reason for ending the turn"),
      context: z
        .string()
        .describe(
          "Context for the messageToUser agent to craft an appropriate response",
        ),
    }),
  ]),
});

export type RouterResponse = z.infer<typeof responseSchema>;
export type TurnPlan = Extract<RouterResponse["result"], { type: "turn_plan" }>;

export async function agentRouter({
  chatId,
  userId,
  document,
  messageHistoryChatOnly,
}: {
  chatId: string;
  userId: string;
  document: LooseLessonPlan;
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
    "router_response_schema",
  );

  const input = JSON.stringify({
    currentDocument: document,
    messageHistoryChatOnly,
  });

  log.info("Router instructions:", input);
  log.info("Router input:", input);

  const result = await openAIClient.responses.parse({
    instructions: routerInstructions({ identity }),
    input,
    stream: false,
    model: "gpt-4.1-2025-04-14",
    text: {
      format: responseFormat,
    },
  });

  return result.output_parsed;
}
