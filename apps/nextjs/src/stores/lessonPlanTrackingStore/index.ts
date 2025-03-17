import { create } from "zustand";

import type { TrackFns } from "@/components/ContextProviders/AnalyticsProvider";
import type { GetStore } from "@/stores/AilaStoresProvider";

import { logStoreUpdates } from "../zustandHelpers";
import { handleAilaStreamingStatusUpdated } from "./actionFunctions/handleAilaStreamingStatusUpdated";
import { handleTrackCompletion } from "./actionFunctions/handleTrackStreamingComplete";
import type { LessonPlanTrackingState } from "./types";

export * from "./types";

// TODO check queueing
// TODO trigger first message at the right time
export const createLessonPlanTrackingStore = ({
  id,
  getStore,
  track,
}: {
  id: string;
  getStore: GetStore;
  track: TrackFns;
}) => {
  const lessonPlanTrackingStore = create<LessonPlanTrackingState>(
    (set, get) => ({
      id,

      userAction: null,
      userMessageContent: null,

      actions: {
        // Actions to record the user intent
        submittedText: (text: string) => {
          set({ userAction: "submit_text", userMessageContent: text });
        },
        clickedContinue: () => {
          set({ userAction: "button_continue", userMessageContent: "" });
        },
        clickedRetry: (text: string) => {
          set({ userAction: "button_retry", userMessageContent: text });
        },
        clickedStartFromExample: (text: string) => {
          set({
            userAction: "start_from_example",
            userMessageContent: text,
          });
        },
        clickedStartFromFreeText: (text: string) => {
          set({
            userAction: "start_from_free_text",
            userMessageContent: text,
          });
        },

        // Action to submit the event with the result
        trackCompletion: handleTrackCompletion(set, get, getStore, track),

        // Hook into ailaStreamingStatus
        ailaStreamingStatusChanged: handleAilaStreamingStatusUpdated(set, get),
      },
    }),
  );

  logStoreUpdates(lessonPlanTrackingStore, "analytics:lesson:store");
  return lessonPlanTrackingStore;
};
