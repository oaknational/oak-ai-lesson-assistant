import { createOpenAIClient } from "@oakai/core/src/llm/openai";

import { zodTextFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";

import { type LooseLessonPlan } from "../../protocol/schema";
import { sectionKeysSchema } from "./lessonPlanSectionGroups";
import { routerInstructions } from "./prompts";

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
              "Explicit guidance notes for downstream agent if applicable, otherwise empty string",
            ),
        }),
      ),
    }),
    z.object({
      type: z.literal("end_turn"),
      message: z.string().describe("Message to the user"),
    }),
  ]),
});

export type RouterResponse = z.infer<typeof responseSchema>;

export async function agentRouter({
  chatId,
  userId,
  document,
  messageHistory,
}: {
  chatId: string;
  userId: string;
  document: LooseLessonPlan;
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

  const input = JSON.stringify({
    currentDocument: document,
    messageHistory,
  });

  const result = await openAIClient.responses.parse({
    instructions: routerInstructions,
    input,
    stream: false,
    model: "gpt-4.1-2025-04-14",
    text: {
      format: responseFormat,
    },
  });

  return result.output_parsed;
}
