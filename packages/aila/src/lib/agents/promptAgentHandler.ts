import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import { aiLogger } from "@oakai/logger";

import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";

import type {
  CompletedLessonPlan,
  LessonPlanKey,
  LooseLessonPlan,
} from "../../protocol/schema";
import type { PromptAgentDefinition, SchemaWithValue } from "./agents";

const log = aiLogger("aila:agents:prompts");

export async function promptAgentHandler<Schema extends SchemaWithValue>({
  agent,
  document,
  additionalInstructions,
  targetKey,
  chatId,
  userId,
  ragData,
}: {
  agent: PromptAgentDefinition<Schema>;
  document: LooseLessonPlan;
  targetKey: LessonPlanKey;
  additionalInstructions: string;
  chatId: string;
  userId: string;
  ragData: CompletedLessonPlan[];
}): Promise<{ content: z.infer<Schema>["value"] }> {
  const openAIClient = createOpenAIClient({
    app: "lesson-assistant",
    chatMeta: {
      chatId,
      userId,
    },
  });
  const responseFormat = zodTextFormat(
    agent.schemaForLLM,
    `${agent.name}_response_schema`,
  );

  const instructions = agent.prompt;
  const input = `### Examples from similar lessons

${ragData.map((lesson, i) => `#### Example ${i + 1}: ${targetKey} from lesson '${lesson.title}'\n\n${agent.extractRagData(lesson)}`).join("\n\n")}
 
    ### Document
${JSON.stringify(document, null, 2)}

### Additional Instructions
${additionalInstructions}`;

  log.info(`Agent: ${agent.name}`);
  log.info("Instructions:", instructions);
  log.info("Input:", input);

  const result = await openAIClient.responses.parse({
    instructions,
    input,
    stream: false,
    model: "gpt-4.1-2025-04-14",
    text: {
      format: responseFormat,
    },
  });

  const parsedResult = result.output_parsed;

  const strictParseResult = agent.schemaStrict.safeParse(parsedResult);
  if (!strictParseResult.success) {
    /**
     * Retry logic in the case that the agent response is not valid.
     * The reason we need this is that structured output does not support
     * all the schema validation that we need.
     */
    log.error("Strict parse error:", strictParseResult.error);
    throw new Error(
      `Agent response did not match the expected schema: ${strictParseResult.error}`,
    );
  }

  if (!targetKey) {
    throw new Error("No target key provided for agent response");
  }
  if (!parsedResult) {
    throw new Error("Agent response was not parsed correctly");
  }

  return {
    content: parsedResult.value,
  };
}
