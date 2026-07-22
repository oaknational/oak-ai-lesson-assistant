import * as Sentry from "@sentry/nextjs";
import type OpenAI from "openai";
import type { ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses";
import type { z } from "zod/v3";

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
import {
  POSITION_PLACEHOLDER,
  type PositionPlaceholder,
} from "./shared/positionPlaceholder";
import type { VoiceId } from "./shared/voices";

export type ResolvedInstructions = {
  /** Instructions used in the runtime prompt. */
  text: string;
  /** Version-stable form stored as the template (defaults to `text`). */
  templateText?: string;
  /** Appended to the agent id to version distinct prompt bodies separately. */
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

/** Versions key-stage-parameterised instructions per key stage. */
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

/** Versions instructions that vary by both key stage and build mode. */
export function keyStageBuildModeInstructions(instructionsByMode: {
  fullRegen: (keyStage: string) => string;
  addOne: (keyStage: string) => string;
  rewriteOne: (
    position: number | PositionPlaceholder,
    keyStage: string,
  ) => string;
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
        // Position is a runtime input, not a distinct prompt: version once per
        // key stage (placeholder body), keep the real position as telemetry.
        return {
          text: instructionsByMode.rewriteOne(mode.position, keyStage),
          templateText: instructionsByMode.rewriteOne(
            POSITION_PLACEHOLDER,
            keyStage,
          ),
          variant: `rewriteOne:${normalisedKeyStage}`,
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
  documentForPrompt,
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
  documentForPrompt?: (document: PartialLessonPlan) => PartialLessonPlan;
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
          templateText: resolved.templateText,
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
          documentForPrompt,
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
