import type { StoreApi } from "zustand";

import type { UserAction } from "@/lib/analytics/helpers";

import type { AilaStreamingStatus } from "../chatStore";

export type LessonPlanTrackingState = {
  id: string;

  userAction: UserAction | null;
  userMessageContent: string | null;

  actions: {
    // Actions to record the user intent
    submittedText: (text: string) => void;
    clickedContinue: () => void;
    clickedRetry: (text: string) => void;
    clickedStartFromExample: (text: string) => void;
    clickedStartFromFreeText: (text: string) => void;

    // Action to submit the event with the result
    trackCompletion: () => void;

    // Hook into ailaStreamingStatus
    ailaStreamingStatusChanged: (status: AilaStreamingStatus) => void;
  };
};

export type LessonPlanGetter = StoreApi<LessonPlanTrackingState>["getState"];
export type LessonPlanSetter = StoreApi<LessonPlanTrackingState>["setState"];
