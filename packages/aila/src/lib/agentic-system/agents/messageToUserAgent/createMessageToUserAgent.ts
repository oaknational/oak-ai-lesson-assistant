import { isTruthy } from "remeda";

import type { GenericPromptAgent, SectionKey } from "../../schema";
import type { MessageToUserAgentProps } from "../../types";
import {
  getVoiceDefinitions,
  getVoicePrompt,
} from "../sectionAgents/shared/voices";
import { changesMadePromptPart } from "../sharedPromptParts/changesMade.part";
import { errorsPromptPart } from "../sharedPromptParts/errors.part";
import { messageHistoryPromptPart } from "../sharedPromptParts/messageHistory.part";
import { plannerAgentResponsePromptPart } from "../sharedPromptParts/plannerAgentResponse.part";
import {
  getQuizBailReasons,
  quizBailReasonsPromptPart,
} from "../sharedPromptParts/quizBailReasons.part";
import { relevantLessonsPromptPart } from "../sharedPromptParts/relevantLessons.part";
import { stepsExecutedPromptPart } from "../sharedPromptParts/stepsExecuted.part";
import { unplannedSectionsPromptPart } from "../sharedPromptParts/unplannedSections.part";
import { userMessagePromptPart } from "../sharedPromptParts/userMessage.part";
import { messageToUserAgentInstructions } from "./messageToUserAgent.instructions";
import {
  type MessageToUserAgentOutput,
  messageToUserAgentSchema,
} from "./messageToUserAgent.schema";

export function createMessageToUserAgent({
  messages,
  prevDoc,
  nextDoc,
  stepsExecuted,
  errors,
  plannerOutput,
  relevantLessons,
  relevantLessonsFetched,
}: MessageToUserAgentProps): GenericPromptAgent<MessageToUserAgentOutput> {
  const bailReasons = getQuizBailReasons(nextDoc as Record<string, unknown>);

  return {
    responseSchema: messageToUserAgentSchema,
    input: [
      {
        role: "developer" as const,
        content: messageToUserAgentInstructions,
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
      bailReasons.length > 0 && {
        role: "developer" as const,
        content: quizBailReasonsPromptPart(bailReasons),
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
          content: relevantLessonsPromptPart(
            relevantLessons.map((r) => r.lessonPlan),
          ),
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
