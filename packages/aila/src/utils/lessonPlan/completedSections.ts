import type { LessonPlanKeys, LooseLessonPlan } from "../../protocol/schema";

export const completedSections = (
  lessonPlan: LooseLessonPlan,
): LessonPlanKeys[] => {
  return Object.keys(lessonPlan).filter((key): key is LessonPlanKeys => {
    return (
      key in lessonPlan && Boolean((lessonPlan as Record<string, unknown>)[key])
    );
  });
};
