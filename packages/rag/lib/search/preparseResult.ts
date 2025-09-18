import { CompletedLessonPlanSchemaWithoutLength } from "../../../aila/src/protocol/schema";
import { migrateLessonPlan } from "../../../aila/src/protocol/schemas/versioning/migrateLessonPlan";
import type { DeepPartial, RagLessonPlanResult } from "../../types";

/**
 * This allows us to massage the data before we parse it.
 * For example, schema version migration and constraining keywords to 5 results.
 * In some cases there are more than 5 keywords in a lesson plan,
 * but our Schema dictates that there should be a maximum of 5.
 * In this case it's better that we slice the array rather than exclude the lesson plan.
 */
export async function preparseResult(result: DeepPartial<RagLessonPlanResult>) {
  const migratedLessonPlan = await migrateLessonPlan({
    lessonPlan: {
      ...result.lessonPlan,
      keywords: result?.lessonPlan?.keywords?.slice(0, 5),
    },
    persistMigration: null,
    outputSchema: CompletedLessonPlanSchemaWithoutLength,
  });
  return {
    ...result,
    lessonPlan: migratedLessonPlan.lessonPlan,
  };
}
