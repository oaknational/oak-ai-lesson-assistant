import type { LessonPlanKeys, LooseLessonPlan } from "../../protocol/schema";

export const completedSections = (
  lessonPlan: LooseLessonPlan,
): LessonPlanKeys[] => {
  return Object.keys(lessonPlan).filter(
    (k): k is keyof LooseLessonPlan =>
      k in lessonPlan && Boolean(lessonPlan[k as keyof LooseLessonPlan]),
  );
};
