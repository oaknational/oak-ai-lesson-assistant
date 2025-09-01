import type { z } from "zod";

import type { GenericPromptAgent } from "../../schema";
import { plannerOutputSchema } from "../../schema";
import type { PlannerAgentProps } from "../../types";
import {
  getVoiceDefinitions,
  getVoicePrompt,
} from "../sectionAgents/shared/voices";
import { currentDocumentPromptPart } from "../sharedPromptParts/currentDocument.part";
import { messageHistoryPromptPart } from "../sharedPromptParts/messageHistory.part";
import { relevantLessonsPromptPart } from "../sharedPromptParts/relevantLessons.part";
import { userMessagePromptPart } from "../sharedPromptParts/userMessage.part";
import { plannerInstructions } from "./plannerAgent.instructions";

/**
 * This is a factory function for planning agents.
 * A planning agent is responsible for generating a plan for Aila's turn in the interaction.
 */
export const createPlannerAgent = ({
  messages,
  document,
  relevantLessons,
}: PlannerAgentProps): GenericPromptAgent<
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
        role: "developer" as const,
        content: getVoiceDefinitions(["AGENT_TO_AGENT"]),
      },
      {
        role: "developer" as const,
        content: getVoicePrompt("AGENT_TO_AGENT"),
      },
      {
        role: "developer" as const,
        content: relevantLessonsPromptPart(relevantLessons),
      },
      {
        role: "developer" as const,
        content: currentDocumentPromptPart(document),
      },
      {
        role: "developer" as const,
        content: messageHistoryPromptPart(messages),
      },
      {
        role: "user" as const,
        content: userMessagePromptPart(messages),
      },
    ],
  };
};
