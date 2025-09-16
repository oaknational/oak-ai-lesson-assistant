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
              /**
               * currently BasedOn schema is just id and title.
               * It would be good for it to more closely follow the AgenticRagLessonPlanResult:
               * - rag asset id;
               * - oak lesson title;
               * - oak lesson slug;
               * - oak lesson plan id
               */
              id: lesson.ragLessonPlanId,
              title: lesson.lessonPlan.title,
            })),
          ),
        ].join("\n\n"),
      },
    ].filter(isTruthy);
  },
});
