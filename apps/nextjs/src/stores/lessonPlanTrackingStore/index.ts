import { aiLogger } from "@oakai/logger";

import { create } from "zustand";

import { exampleMessages } from "@/components/AppComponents/Chat/chat-start";
import type { TrackFns } from "@/components/ContextProviders/AnalyticsProvider";
import { ComponentType } from "@/lib/avo/Avo";
import type { GetStore } from "@/stores/AilaStoresProvider";

import { logStoreUpdates } from "../zustandHelpers";
import { handleTrackCompletion } from "./actionFunctions/handleTrackStreamingComplete";
import { handleUserIntent } from "./actionFunctions/handleUserIntent";
import type { LessonPlanTrackingState } from "./types";

export * from "./types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = aiLogger("analytics:lesson:store");

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

      currentIntent: null,
      queuedIntent: null,

      lastLessonPlan: {},

      actions: {
        // Actions to record the user intent
        submittedText: (text) => {
          handleUserIntent(set, get, {
            componentType: ComponentType.TYPE_EDIT,
            text,
          });
        },
        clickedContinue: () => {
          handleUserIntent(set, get, {
            componentType: ComponentType.CONTINUE_BUTTON,
            text: "",
          });
        },
        clickedRetry: (text) => {
          handleUserIntent(set, get, {
            componentType: ComponentType.REGENERATE_RESPONSE_BUTTON,
            text,
          });
        },
        clickedStart: (text) => {
          // We can't store the start action as this store won't exist at that point
          // Instead, infer whether it was started from an example or free text
          const isExample = exampleMessages.some(
            (message) => message.message === text,
          );
          if (isExample) {
            handleUserIntent(set, get, {
              componentType: ComponentType.EXAMPLE_LESSON_BUTTON,
              text,
            });
          } else {
            handleUserIntent(set, get, {
              componentType: ComponentType.TEXT_INPUT,
              text,
            });
          }
        },
        clickedModify: (option, feedbackText) => {
          handleUserIntent(set, get, {
            componentType: ComponentType.MODIFY_BUTTON,
            text: option.label === "Other" ? feedbackText : option.label,
          });
        },

        // Action to submit the event with the result
        trackCompletion: handleTrackCompletion(set, get, getStore, track),

        prepareForNextMessage: () => {
          const { queuedIntent } = get();
          set({
            currentIntent: queuedIntent,
            queuedIntent: null,
            lastLessonPlan: getStore("lessonPlan").lessonPlan,
          });
        },
        clearQueuedIntent: () => {
          if (get().queuedIntent) {
            set({ queuedIntent: null });
          }
        },

        // Hook into ailaStreamingStatus
        ailaStreamingStatusUpdated: (streamingStatus) => {
          if (streamingStatus === "Idle") {
            try {
              get().actions.trackCompletion();
            } finally {
              get().actions.prepareForNextMessage();
            }
          }
        },
      },
    }),
  );

  logStoreUpdates(lessonPlanTrackingStore, "analytics:lesson:store");
  return lessonPlanTrackingStore;
};
