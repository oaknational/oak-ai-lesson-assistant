import { LessonPlan as DatabaseLessonPlan } from "@oakai/db";

import { LooseLessonPlan } from "../../protocol/schema";

export function minifyLessonPlanForRelevantLessons(
  lessonPlan: DatabaseLessonPlan,
) {
  const { id } = lessonPlan;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { exitQuiz, starterQuiz, ...rest } =
    lessonPlan.content as LooseLessonPlan;
  return { id, ...rest };
}
