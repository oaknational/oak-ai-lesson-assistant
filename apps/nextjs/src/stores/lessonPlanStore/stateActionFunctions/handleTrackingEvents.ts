import invariant from "tiny-invariant";

import type { LessonPlanTrackingContextProps } from "@/lib/analytics/lessonPlanTrackingContext";

import type { LessonPlanStore } from "..";

export const handleTrackingEvents = (
  lessonPlanTracking: LessonPlanTrackingContextProps,
  get: () => LessonPlanStore,
) => {
  const { chatActions } = get();

  const messages = chatActions?.getMessages();
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
