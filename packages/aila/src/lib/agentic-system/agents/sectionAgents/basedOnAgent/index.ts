import { isTruthy } from "remeda";

import { BasedOnSchema } from "../../../../../protocol/schema";
import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { createSectionAgent } from "../createSectionAgent";
import { basedOnInstructions } from "./basedOn.instructions";

export const basedOnAgent = createSectionAgent({
  responseSchema: BasedOnSchema.nullable(),
  instructions: basedOnInstructions,
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
  extraInputFromCtx: (ctx) => {
    return [
      ctx.persistedState.relevantLessons && {
        role: "developer" as const,
        content: [
          "RELEVANT LESSONS",
          "The following lessons were shown to the user:",
          JSON.stringify(
            ctx.persistedState.relevantLessons.map((lesson) => ({
              id: lesson.ragLessonPlanId,
              title: lesson.lessonPlan.title,
            })),
          ),
        ].join("\n\n"),
      },
    ].filter(isTruthy);
  },
});
