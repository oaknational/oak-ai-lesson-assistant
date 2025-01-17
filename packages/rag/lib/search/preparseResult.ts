import type { DeepPartial, RagLessonPlanResult } from "../../types";

/**
 * This allows us to massage the data before we parse it.
 * For example, in some cases there are more than 5 keywords in a lesson plan,
 * but our Schema dicates that there should be a maximum of 5.
 * In this case it's better that we slice the array rather than exclude the lesson plan.
 */
export function preparseResult(result: DeepPartial<RagLessonPlanResult>) {
  return {
    ...result,
    lessonPlan: {
      ...result.lessonPlan,
      keywords: result?.lessonPlan?.keywords?.slice(0, 5),
    },
  };
}
