import type OpenAI from "openai";
import type { LooseLessonPlan } from "protocol/schema";
import type { z } from "zod";

import type { RagLessonPlan } from "../../../utils/rag/fetchRagContent";
import { executeGenericPromptAgent } from "../executeGenericPromptAgent";
import type { AilaExecutionContext } from "../types";
import { getRelevantRAGValues } from "./getRevelantRAGValues";
import { sectionToGenericAgent } from "./sectionToGenericPromptAgent";

/**
 * This is a factory function for section agents.
 * A section agent is responsible for generating a specific section of the document.
 */
export function createSectionAgent<ResponseType>({
  responseSchema,
  instructions,
  contentToString = defaultContentToString,
  extraInputFromCtx,
}: {
  responseSchema: z.ZodType<ResponseType>;
  instructions: string;
  contentToString?: (content: ResponseType) => string;
  extraInputFromCtx?: (
    state: AilaExecutionContext,
  ) => { role: "user" | "developer"; content: string }[];
}) {
  return ({
    id,
    description,
    openAIClient,
    contentFromDocument,
  }: {
    id: string;
    description: string;
    openAIClient: OpenAI;
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

      const genericPromptAgent = sectionToGenericAgent<ResponseType>({
        responseSchema,
        instructions,
        messages: ctx.persistedState.messages,
        contentToString,
        basedOnContent,
        exemplarContent,
        currentValue,
        ctx,
        extraInputFromCtx,
      });

      return executeGenericPromptAgent({
        agent: genericPromptAgent,
        openAIClient,
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
      return "[Unstringifiable Object]";
    }
  }
  return String(content);
}
