import type { z } from "zod";

import type { GenericPromptAgentPrompt } from "../schema";
import { plannerOutputSchema } from "../schema";
import { currentDocumentPromptPart } from "../sharedPromptParts/currentDocument.part";
import { messageHistoryPromptPart } from "../sharedPromptParts/messageHistory.part";
import { relevantLessonsPromptPart } from "../sharedPromptParts/relevantLessons.part";
import { userMessagePromptPart } from "../sharedPromptParts/userMessage.part";
import type { PlannerAgentProps } from "../types";
import { plannerInstructions } from "./plannerInstructions";

/**
 * This is a factory function for planning agents.
 * A planning agent is responsible for generating a plan for Aila's turn in the interaction.
 */
export const createPlannerAgent = ({
  messages,
  document,
  relevantLessons,
}: PlannerAgentProps): GenericPromptAgentPrompt<
  z.infer<typeof plannerOutputSchema>
> => {
  return {
    responseSchema: plannerOutputSchema,
    input: [
      {
        role: "developer",
        content: plannerInstructions,
      },
      {
        role: "user" as const,
        content: relevantLessonsPromptPart(relevantLessons),
      },
      {
        role: "user" as const,
        content: currentDocumentPromptPart(document),
      },
      {
        role: "user" as const,
        content: messageHistoryPromptPart(messages),
      },
      {
        role: "user" as const,
        content: userMessagePromptPart(messages),
      },
    ],
  };
};
