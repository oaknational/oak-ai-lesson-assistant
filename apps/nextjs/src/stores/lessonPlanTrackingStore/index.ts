import { aiLogger } from "@oakai/logger";

import { create } from "zustand";

import { exampleMessages } from "@/components/AppComponents/Chat/chat-start";
import type { TrackFns } from "@/components/ContextProviders/AnalyticsProvider";
import { ComponentType } from "@/lib/avo/Avo";
import type { GetStore } from "@/stores/AilaStoresProvider";

import type { AilaStreamingStatus } from "../chatStore";
import { logStoreUpdates } from "../zustandHelpers";
import { handleTrackCompletion } from "./actionFunctions/handleTrackStreamingComplete";
import { handleUserIntent } from "./actionFunctions/handleUserIntent";
import type { LessonPlanTrackingState } from "./types";

export * from "./types";

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

      currentMessage: null,
      queuedMessage: null,

      lastLessonPlan: {},

      actions: {
        // Actions to record the user intent
        submittedText: (text: string) => {
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
        clickedRetry: (text: string) => {
          handleUserIntent(set, get, {
            componentType: ComponentType.REGENERATE_RESPONSE_BUTTON,
            text,
          });
        },
        clickedStart: (text: string) => {
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
        clickedModify: (text: string) => {
          log.warn("clickedModify not implemented", text);
          // handleUserIntent(set, get, {
          //   componentType: ComponentType.MODIFY_BUTTON,
          //   text,
          // });
        },

        // Action to submit the event with the result
        trackCompletion: handleTrackCompletion(set, get, getStore, track),

        prepareForNextMessage: () => {
          const { queuedMessage } = get();
          // TODO: behaviour to unqueue when cancelling
          set({
            currentMessage: queuedMessage,
            queuedMessage: null,
            lastLessonPlan: getStore("lessonPlan").lessonPlan,
          });
        },

        // Hook into ailaStreamingStatus
        ailaStreamingStatusUpdated: (streamingStatus: AilaStreamingStatus) => {
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
