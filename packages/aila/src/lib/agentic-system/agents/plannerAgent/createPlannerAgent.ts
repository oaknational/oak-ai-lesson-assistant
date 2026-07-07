import type { z } from "zod";

import { DEFAULT_AGENT_MODEL_PARAMS } from "../../constants";
import type { GenericPromptAgent } from "../../schema";
import { plannerOutputSchema } from "../../schema";
import type { PlannerAgentProps } from "../../types";
import { AGENTIC_PROMPT_TEMPLATES } from "../agenticPromptTemplates";
import { staticPromptParts } from "../sectionAgents/shared/staticPromptParts";
import { currentDocumentPromptPart } from "../sharedPromptParts/currentDocument.part";
import { messageHistoryPromptPart } from "../sharedPromptParts/messageHistory.part";
import { relevantLessonsPromptPart } from "../sharedPromptParts/relevantLessons.part";
import { userMessagePromptPart } from "../sharedPromptParts/userMessage.part";

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
      ...staticPromptParts(AGENTIC_PROMPT_TEMPLATES.planner),
      {
        role: "developer" as const,
        content: relevantLessonsPromptPart(
          relevantLessons ? relevantLessons.map((r) => r.lessonPlan) : null,
        ),
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
    modelParams: {
      ...DEFAULT_AGENT_MODEL_PARAMS,
    },
  };
};
