import { isTruthy } from "remeda";

import { BasedOnSchema } from "../../../../../protocol/schema";
import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { createSectionAgent } from "../createSectionAgent";
import { basedOnInstructions } from "./basedOn.instructions";
import { resolveBasedOnAgainstRelevantLessons } from "./resolveBasedOnAgainstRelevantLessons";

const createBaseAgent = createSectionAgent({
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

export const basedOnAgent: typeof createBaseAgent = (args) => {
  const agent = createBaseAgent(args);
  return {
    ...agent,
    handler: async (ctx) => {
      const result = await agent.handler(ctx);
      if (result.error !== null || result.data == null) {
        return result;
      }
      return {
        ...result,
        data: resolveBasedOnAgainstRelevantLessons(
          result.data,
          ctx.persistedState.relevantLessons,
        ),
      };
    },
  };
};
