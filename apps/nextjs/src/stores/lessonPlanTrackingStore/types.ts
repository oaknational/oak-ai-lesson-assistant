import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";

import type { AilaUserModificationAction } from "@prisma/client";
import type { StoreApi } from "zustand";

import type { FeedbackOption } from "@/components/AppComponents/Chat/drop-down-section/drop-down-form-wrapper";
import type { ComponentTypeValueType } from "@/lib/avo/Avo";

import type { AilaStreamingStatus } from "../chatStore";

export type MessageIntent = {
  componentType: ComponentTypeValueType;
  text: string;
};

export type LessonPlanTrackingState = {
  id: string;

  currentMessage: MessageIntent | null;
  queuedMessage: MessageIntent | null;

  lastLessonPlan: LooseLessonPlan;

  actions: {
    // Actions to record the user intent
    submittedText: (text: string) => void;
    clickedContinue: () => void;
    clickedRetry: (text: string) => void;
    clickedStart: (text: string) => void;
    clickedModify: (
      option: FeedbackOption<AilaUserModificationAction>,
      feedbackText: string,
    ) => void;

    // Action to submit the event with the result
    trackCompletion: () => void;

    prepareForNextMessage: () => void;

    // Hook into ailaStreamingStatus
    ailaStreamingStatusUpdated: (status: AilaStreamingStatus) => void;
  };
};

export type LessonPlanTrackingGetter =
  StoreApi<LessonPlanTrackingState>["getState"];
export type LessonPlanTrackingSetter =
  StoreApi<LessonPlanTrackingState>["setState"];
