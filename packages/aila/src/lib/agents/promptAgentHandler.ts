import { createOpenAIClient } from "@oakai/core/src/llm/openai";

import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";

import type {
  CompletedLessonPlan,
  LessonPlanKey,
  LooseLessonPlan,
} from "../../protocol/schema";
import type { PromptAgentDefinition, SchemaWithValue } from "./agents";

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
    agent.schema,
    `${agent.name}_response_schema`,
  );

  const result = await openAIClient.responses.parse({
    instructions: agent.prompt,
    input: `### Examples from similar lessons

${ragData.map((lesson) => `#### ${targetKey} ${lesson.title}\n\n${agent.extractRagData(lesson)}`).join("\n\n")}
 
    ### Document
${JSON.stringify(document, null, 2)}

### Additional Instructions
${additionalInstructions}`,
    stream: false,
    model: "gpt-4.1-2025-04-14",
    text: {
      format: responseFormat,
    },
  });

  const parsedResult = result.output_parsed;

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
