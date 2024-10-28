import type { LessonPlan as DatabaseLessonPlan } from "@oakai/db";

import type { CompletedLessonPlan } from "../../protocol/schema";

export function minifyLessonPlanForRelevantLessons(
  lessonPlan: DatabaseLessonPlan,
) {
  const { id } = lessonPlan;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { exitQuiz, starterQuiz, ...rest } =
    lessonPlan.content as CompletedLessonPlan; // @todo, after next ingest, start parsing the content properly
  return { id, ...rest };
}
