import invariant from "tiny-invariant";

import type { LessonPlanTrackingContextProps } from "@/lib/analytics/lessonPlanTrackingContext";
import type { GetStore } from "@/stores/AilaStoresProvider";

import type { LessonPlanStore } from "..";

export const handleTrackingEvents = (
  lessonPlanTracking: LessonPlanTrackingContextProps,
  getStore: GetStore,
  get: () => LessonPlanStore,
) => {
  const messages = getStore("chat").stableMessages;

  const prevLesson = get().lastLessonPlan;
  const nextLesson = get().lessonPlan;
  invariant(
    messages,
    "chatActions passed into store in provider, stable messages is defined",
  );
  lessonPlanTracking.onStreamFinished({
    prevLesson,
    nextLesson,
    messages,
  });
};
