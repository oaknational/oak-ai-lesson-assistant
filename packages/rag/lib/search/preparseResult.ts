import { migrateLessonPlan } from "../../../aila/src/protocol/schemas/versioning/migrateLessonPlan";
import type { DeepPartial, RagLessonPlanResult } from "../../types";

/**
 * This allows us to massage the data before we parse it.
 * For example, schema version migration and constraining keywords to 5 results
 */
export async function preparseResult(result: DeepPartial<RagLessonPlanResult>) {
  const migratedLessonPlan = await migrateLessonPlan({
    lessonPlan: {
      ...result.lessonPlan,
      keywords: result?.lessonPlan?.keywords?.slice(0, 5),
    },
    persistMigration: null,
  });
  return {
    ...result,
    lessonPlan: migratedLessonPlan.lessonPlan,
  };
}
