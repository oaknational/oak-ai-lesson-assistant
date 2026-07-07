import * as Sentry from "@sentry/nextjs";
import type OpenAI from "openai";
import type { ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses";
import type { z } from "zod";

import type { PartialLessonPlan } from "../../../../protocol/schema";
import type { AilaExecutionContext } from "../../types";
import { getAgenticPromptTemplate } from "../agenticPromptTemplates";
import {
  type GenerationCollector,
  executeGenericPromptAgent,
} from "../executeGenericPromptAgent";
import { sectionToGenericPromptAgent } from "../sectionToGenericPromptAgent";
import { getRelevantRAGValues } from "./getRevelantRAGValues";

type ResolvedInstructions = {
  text: string;
  promptTemplateId?: string;
  promptInputs?: Record<string, unknown>;
};

type InstructionsValue =
  | string
  | ((ctx: AilaExecutionContext) => string | ResolvedInstructions);

function resolveInstructions(
  instructions: InstructionsValue,
  ctx: AilaExecutionContext,
): ResolvedInstructions {
  const resolved =
    typeof instructions === "function" ? instructions(ctx) : instructions;

  return typeof resolved === "string" ? { text: resolved } : resolved;
}

/**
 * This is a factory function for section agents.
 * A section agent is responsible for generating a specific section of the document.
 *
 * Voice configuration is sourced from AGENTIC_PROMPT_TEMPLATES (keyed by the
 * resolved prompt template id) so the runtime prompt and the persisted prompt
 * template share one definition.
 */
export function createSectionAgent<ResponseType>({
  responseSchema,
  instructions,
  contentToString = defaultContentToString,
  extraInputFromCtx,
  modelParams,
}: {
  responseSchema: z.ZodType<ResponseType>;
  instructions: InstructionsValue;
  contentToString?: (content: ResponseType) => string;
  extraInputFromCtx?: (
    state: AilaExecutionContext,
  ) => { role: "user" | "developer"; content: string }[];
  modelParams: Omit<
    ResponseCreateParamsNonStreaming,
    "input" | "text" | "stream"
  >;
}) {
  return ({
    id,
    description,
    openai,
    contentFromDocument,
    collectGeneration,
  }: {
    id: string;
    description: string;
    openai: OpenAI;
    contentFromDocument: (
      document: PartialLessonPlan,
    ) => ResponseType | undefined;
    collectGeneration?: GenerationCollector;
  }) => ({
    id,
    description,
    handler: (ctx: AilaExecutionContext) => {
      const resolvedInstructions = resolveInstructions(instructions, ctx);
      const promptTemplateId = resolvedInstructions.promptTemplateId ?? id;

      const { basedOnContent, exemplarContent, currentValue } =
        getRelevantRAGValues({
          ctx,
          contentFromDocument,
        });

      const promptTemplate = getAgenticPromptTemplate(promptTemplateId);
      const genericPromptAgent = sectionToGenericPromptAgent(
        {
          responseSchema,
          instructions: resolvedInstructions.text,
          messages: ctx.persistedState.messages,
          contentToString,
          basedOnContent,
          exemplarContent,
          currentValue,
          ctx,
          extraInputFromCtx,
          defaultVoice: promptTemplate?.defaultVoice,
          voices: promptTemplate?.voices,
        },
        modelParams,
      );

      return executeGenericPromptAgent({
        agent: genericPromptAgent,
        agentId: id,
        promptTemplateId,
        openai,
        collectGeneration,
        promptInputs: {
          sectionKey: ctx.currentTurn.currentStep?.sectionKey,
          action: ctx.currentTurn.currentStep?.action,
          quizIntent: ctx.currentTurn.currentStep?.quizIntent,
          ...resolvedInstructions.promptInputs,
        },
      });
    },
  });
}

function defaultContentToString(content: unknown): string {
  if (content === null || content === undefined) return String(content);
  if (typeof content === "object") {
    try {
      return JSON.stringify(content);
    } catch {
      Sentry.captureException(new Error("Failed to serialize content"), {
        extra: { content },
      });
      return "[Non-serializable Object]";
    }
  }
  return String(content);
}
