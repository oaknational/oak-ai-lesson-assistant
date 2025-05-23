import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import { aiLogger } from "@oakai/logger";

import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import type {
  CompletedLessonPlan,
  LessonPlanKey,
  LooseLessonPlan,
} from "../../protocol/schema";
import type { PromptAgentDefinition } from "./agents";

const log = aiLogger("aila:agents:prompts");

export async function promptAgentHandler<
  Schema extends z.ZodSchema,
  SchemaStrict extends z.ZodSchema,
>({
  agent,
  document,
  additionalInstructions,
  targetKey,
  chatId,
  userId,
  ragData,
}: {
  agent: PromptAgentDefinition<Schema, SchemaStrict>;
  document: LooseLessonPlan;
  targetKey: LessonPlanKey;
  additionalInstructions: string;
  chatId: string;
  userId: string;
  ragData: CompletedLessonPlan[];
}): Promise<
  | { success: true; content: z.infer<SchemaStrict> }
  | { success: false; error: string }
> {
  const openAIClient = createOpenAIClient({
    app: "lesson-assistant",
    chatMeta: {
      chatId,
      userId,
    },
  });
  const schema = z.object({
    output: z.union([
      z.object({ success: z.literal(true), value: agent.schemaForLLM }),
      z.object({ success: z.literal(false), error: z.string() }),
    ]),
  });
  const responseFormat = zodTextFormat(schema, `${agent.name}_response_schema`);

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

  if (
    result.output_parsed?.output?.success &&
    "value" in result.output_parsed.output
  ) {
    const strictParseResult = agent.schemaStrict.safeParse(
      result.output_parsed.output.value,
    );
    if (!strictParseResult.success) {
      /**
       * Retry logic in the case that the initial agent response is not valid.
       * The reason we need this is that structured output does not support
       * all the schema validation that we need.
       */
      const inputWithRetryInstructions =
        input +
        `\n\n### Note\nThis is a retry because the previous response was not valid. Your previous response output was: ${JSON.stringify(
          result.output_parsed.output.value,
        )}, however the strict schema is: ${JSON.stringify(
          agent.schemaStrict,
        )}; the error was ${JSON.stringify(strictParseResult.error.errors)} If the user's request is at odds with the schema, please respond with a message explaining the issue. Another agent will handle messaging to the user.`;
      const retryResult = await openAIClient.responses.parse({
        instructions,
        input: inputWithRetryInstructions,
        stream: false,
        model: "gpt-4.1-2025-04-14",
        text: {
          format: responseFormat,
        },
      });

      if (
        retryResult.output_parsed?.output?.success &&
        "value" in retryResult.output_parsed.output
      ) {
        const strictParseRetryResult = agent.schemaStrict.safeParse(
          retryResult.output_parsed.output?.value,
        );

        if (!strictParseRetryResult.success) {
          /**
           * If the retry also fails, we need to return the error message
           * from the first attempt and the second attempt.
           */
          return {
            success: false,
            error: `Agent response was not valid after retry. The first attempt error was ${JSON.stringify(
              strictParseResult.error.errors,
            )}, the second attempt error was ${JSON.stringify(
              strictParseRetryResult.error.errors,
            )}`,
          };
        } else {
          return {
            success: true,
            content: strictParseRetryResult.data,
          };
        }
      } else {
        /**
         * In this case, the retry has returned an error, so we need to return
         * the error message from the agent.
         */
        const errorMessage =
          retryResult.output_parsed?.output &&
          "error" in retryResult.output_parsed.output
            ? retryResult.output_parsed.output.error
            : "Unknown error";
        return {
          success: false,
          error: `Agent response was not valid after retry. The error was: ${errorMessage}`,
        };
      }
    } else {
      /**
       * If the response is valid, we need to return the parsed result.
       */
      return {
        success: true,
        content: strictParseResult.data,
      };
    }
  } else {
    /**
     * The response was not valid, we need to return the error message
     * from the agent.
     */
    const errorMessage =
      result.output_parsed?.output && "error" in result.output_parsed.output
        ? result.output_parsed.output.error
        : "Unknown error";
    return {
      success: false,
      error: `Agent response was not valid. The error was: ${errorMessage}`,
    };
  }
}
