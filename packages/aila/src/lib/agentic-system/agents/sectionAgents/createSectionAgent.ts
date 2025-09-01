import type OpenAI from "openai";
import type { LooseLessonPlan } from "protocol/schema";
import type { z } from "zod";

import type { RagLessonPlan } from "../../../../utils/rag/fetchRagContent";
import type { AilaExecutionContext } from "../../types";
import { executeGenericPromptAgent } from "../executeGenericPromptAgent";
import { sectionToGenericPromptAgent } from "../sectionToGenericPromptAgent";
import { getRelevantRAGValues } from "./getRevelantRAGValues";
import type { VoiceId } from "./shared/voices";

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
}: {
  responseSchema: z.ZodType<ResponseType>;
  instructions: string;
  contentToString?: (content: ResponseType) => string;
  extraInputFromCtx?: (
    state: AilaExecutionContext,
  ) => { role: "user" | "developer"; content: string }[];
  defaultVoice?: VoiceId;
  voices?: VoiceId[];
}) {
  return ({
    id,
    description,
    openai,
    contentFromDocument,
  }: {
    id: string;
    description: string;
    openai: OpenAI;
    contentFromDocument: (
      document: LooseLessonPlan | RagLessonPlan,
    ) => ResponseType | undefined;
  }) => ({
    id,
    description,
    handler: (ctx: AilaExecutionContext) => {
      const { basedOnContent, exemplarContent, currentValue } =
        getRelevantRAGValues({
          ctx,
          contentFromDocument,
        });

      const genericPromptAgent = sectionToGenericPromptAgent({
        responseSchema,
        instructions,
        messages: ctx.persistedState.messages,
        contentToString,
        basedOnContent,
        exemplarContent,
        currentValue,
        ctx,
        extraInputFromCtx,
        defaultVoice,
        voices,
      });

      return executeGenericPromptAgent({
        agent: genericPromptAgent,
        openai,
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
      return "[Non-serializable Object]";
    }
  }
  return String(content);
}
