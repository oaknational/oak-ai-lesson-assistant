import type OpenAI from "openai";
import type { LooseLessonPlan } from "protocol/schema";
import type { z } from "zod";

import type { RagLessonPlan } from "../../../utils/rag/fetchRagContent";
import { executeGenericPromptAgent } from "../executeGenericPromptAgent";
import type { AilaState, SectionAgentHandlerProps } from "../types";
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
  extraInputFromState,
}: {
  responseSchema: z.ZodType<ResponseType>;
  instructions: string;
  contentToString?: (content: ResponseType) => string;
  extraInputFromState?: (
    state: AilaState,
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
    handler: ({ state, currentTurn }: SectionAgentHandlerProps) => {
      const { basedOnContent, exemplarContent, currentValue } =
        getRelevantRAGValues({
          state,
          currentTurn,
          contentFromDocument,
        });

      const genericPromptAgent = sectionToGenericAgent<ResponseType>({
        responseSchema,
        instructions,
        messages: state.messages,
        contentToString,
        basedOnContent,
        exemplarContent,
        currentValue,
        state,
        extraInputFromState,
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
