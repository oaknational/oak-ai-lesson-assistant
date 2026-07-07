import * as Sentry from "@sentry/nextjs";
import type OpenAI from "openai";
import type { ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses";
import type { z } from "zod";

import type { PartialLessonPlan } from "../../../../protocol/schema";
import { deriveSectionBuildMode } from "../../quizOperations/deriveSectionBuildMode";
import type { AilaExecutionContext } from "../../types";
import {
  type GenerationCollector,
  executeGenericPromptAgent,
} from "../executeGenericPromptAgent";
import { sectionToGenericPromptAgent } from "../sectionToGenericPromptAgent";
import { getRelevantRAGValues } from "./getRevelantRAGValues";
import { normaliseKeyStageForPrompt } from "./shared/keyStageLanguageGuidance";
import type { VoiceId } from "./shared/voices";

/**
 * Instructions may resolve to a plain string, or to a richer object when the
 * agent's prompt varies along an axis that should be versioned separately:
 * - `text` — the instructions used in the (runtime and stored) prompt.
 * - `variant` — appended to the agent id to form the promptTemplateId, so each
 *   distinct prompt body gets its own versioned prompt row (e.g. key stage,
 *   build mode, rewrite position).
 * - `promptInputs` — extra telemetry persisted alongside the generation.
 */
export type ResolvedInstructions = {
  text: string;
  variant?: string;
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
 * Wraps key-stage-parameterised instructions so the resolved prompt is
 * versioned per key stage.
 */
export function keyStageInstructions(
  instructionsForKeyStage: (keyStage: string) => string,
): (ctx: AilaExecutionContext) => ResolvedInstructions {
  return (ctx) => {
    const keyStage = ctx.currentTurn.document.keyStage ?? "";
    return {
      text: instructionsForKeyStage(keyStage),
      variant: normaliseKeyStageForPrompt(keyStage),
      promptInputs: { keyStage },
    };
  };
}

/**
 * Wraps instructions that vary by both key stage and build mode (full
 * regenerate / add one / rewrite one), versioning the prompt per combination.
 */
export function keyStageBuildModeInstructions(instructionsByMode: {
  fullRegen: (keyStage: string) => string;
  addOne: (keyStage: string) => string;
  rewriteOne: (position: number, keyStage: string) => string;
}): (ctx: AilaExecutionContext) => ResolvedInstructions {
  return (ctx) => {
    const keyStage = ctx.currentTurn.document.keyStage ?? "";
    const normalisedKeyStage = normaliseKeyStageForPrompt(keyStage);
    const mode = deriveSectionBuildMode(ctx.currentTurn.currentStep);
    switch (mode.kind) {
      case "fullRegen":
        return {
          text: instructionsByMode.fullRegen(keyStage),
          variant: `fullRegen:${normalisedKeyStage}`,
          promptInputs: { keyStage, buildMode: "fullRegen" },
        };
      case "addOne":
        return {
          text: instructionsByMode.addOne(keyStage),
          variant: `addOne:${normalisedKeyStage}`,
          promptInputs: { keyStage, buildMode: "addOne" },
        };
      case "rewriteOne":
        return {
          text: instructionsByMode.rewriteOne(mode.position, keyStage),
          variant: `rewriteOne:${mode.position}:${normalisedKeyStage}`,
          promptInputs: {
            keyStage,
            buildMode: "rewriteOne",
            position: mode.position,
          },
        };
    }
  };
}

/**
 * This is a factory function for section agents.
 * A section agent is responsible for generating a specific section of the document.
 */
export function createSectionAgent<ResponseType>({
  responseSchema,
  instructions,
  contentToString = defaultContentToString,
  extraInputFromCtx,
  defaultVoice,
  voices,
  modelParams,
}: {
  responseSchema: z.ZodType<ResponseType>;
  instructions: InstructionsValue;
  contentToString?: (content: ResponseType) => string;
  extraInputFromCtx?: (
    state: AilaExecutionContext,
  ) => { role: "user" | "developer"; content: string }[];
  defaultVoice?: VoiceId;
  voices?: VoiceId[];
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
      ctx: AilaExecutionContext,
    ) => ResponseType | undefined;
    collectGeneration?: GenerationCollector;
  }) => ({
    id,
    description,
    handler: (ctx: AilaExecutionContext) => {
      const resolved = resolveInstructions(instructions, ctx);
      const promptTemplateId = resolved.variant
        ? `${id}:${resolved.variant}`
        : id;

      const { basedOnContent, exemplarContent, currentValue } =
        getRelevantRAGValues({
          ctx,
          contentFromDocument,
        });

      const genericPromptAgent = sectionToGenericPromptAgent(
        {
          responseSchema,
          id,
          instructions: resolved.text,
          promptTemplateId,
          promptInputs: {
            sectionKey: ctx.currentTurn.currentStep?.sectionKey,
            action: ctx.currentTurn.currentStep?.action,
            ...resolved.promptInputs,
          },
          messages: ctx.persistedState.messages,
          contentToString,
          basedOnContent,
          exemplarContent,
          currentValue,
          ctx,
          extraInputFromCtx,
          defaultVoice,
          voices,
        },
        modelParams,
      );

      return executeGenericPromptAgent({
        agent: genericPromptAgent,
        openai,
        collectGeneration,
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
