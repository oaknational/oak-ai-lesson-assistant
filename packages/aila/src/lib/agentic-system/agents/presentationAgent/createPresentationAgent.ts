import { isTruthy } from "remeda";

import type { GenericPromptAgent, SectionKey } from "../../schema";
import type { PresentationAgentProps } from "../../types";
import {
  getVoiceDefinitions,
  getVoicePrompt,
} from "../sectionAgents/shared/voices";
import { changesMadePromptPart } from "../sharedPromptParts/changesMade.part";
import { errorsPromptPart } from "../sharedPromptParts/errors.part";
import { messageHistoryPromptPart } from "../sharedPromptParts/messageHistory.part";
import { plannerAgentResponsePromptPart } from "../sharedPromptParts/plannerAgentResponse.part";
import { relevantLessonsPromptPart } from "../sharedPromptParts/relevantLessons.part";
import { stepsExecutedPromptPart } from "../sharedPromptParts/stepsExecuted.part";
import { unplannedSectionsPromptPart } from "../sharedPromptParts/unplannedSections.part";
import { userMessagePromptPart } from "../sharedPromptParts/userMessage.part";
import { presentationAgentInstructions } from "./presentationAgent.instructions";
import {
  type PresentationAgentOutput,
  presentationAgentSchema,
} from "./presentationAgent.schema";

/**
 * This is a factory function for a presentation agent.
 * A presentation agent is responsible for presenting Aila's changes to the user in the form of a message.
 */
export function createPresentationAgent({
  messages,
  prevDoc,
  nextDoc,
  stepsExecuted,
  errors,
  plannerOutput,
  relevantLessons,
  relevantLessonsFetched,
}: PresentationAgentProps): GenericPromptAgent<PresentationAgentOutput> {
  return {
    responseSchema: presentationAgentSchema,
    input: [
      {
        role: "developer" as const,
        content: presentationAgentInstructions,
      },
      {
        role: "developer" as const,
        content: getVoiceDefinitions(["AILA_TO_TEACHER"]),
      },
      {
        role: "developer" as const,
        content: getVoicePrompt("AILA_TO_TEACHER"),
      },
      errors.length > 0 && {
        role: "developer" as const,
        content: errorsPromptPart(errors),
      },
      plannerOutput?.decision === "exit" && {
        role: "developer" as const,
        content: plannerAgentResponsePromptPart(plannerOutput),
      },
      stepsExecuted.length > 0 && {
        role: "developer" as const,
        content: stepsExecutedPromptPart(stepsExecuted),
      },
      stepsExecuted.length > 0 && {
        role: "developer" as const,
        content: changesMadePromptPart({ prevDoc, nextDoc }),
      },
      {
        role: "developer" as const,
        content: unplannedSectionsPromptPart(
          Object.entries(nextDoc)
            .filter(([, value]) => !value)
            .map(([key]) => key as SectionKey), // @todo fix this
        ),
      },
      relevantLessonsFetched &&
        relevantLessons &&
        relevantLessons?.length > 0 && {
          role: "developer" as const,
          content: relevantLessonsPromptPart(relevantLessons),
        },
      {
        role: "developer" as const,
        content: messageHistoryPromptPart(messages),
      },
      {
        role: "user" as const,
        content: userMessagePromptPart(messages),
      },
    ].filter(isTruthy),
  };
}
