import { aiLogger } from "@oakai/logger";

import { createStore } from "zustand";

import type { TrpcUtils } from "@/utils/trpc";

import { logStoreUpdates } from "../zustandHelpers";
import { handleMessagesUpdated } from "./stateActionFunctions/handleMessagesUpdated";
import { handleRefetch } from "./stateActionFunctions/handleRefetch";
import type { LessonPlanState } from "./types";

export * from "./types";

const log = aiLogger("lessons:store");

const initialPerMessageState = {
  sectionsToEdit: [],
  appliedPatchHashes: [],
  appliedPatchPaths: [],
  numberOfStreamedCompleteParts: 0,
} satisfies Partial<LessonPlanState>;

export const createLessonPlanStore = ({
  id,
  trpcUtils,
  initialValues,
}: {
  id: string;
  trpcUtils: TrpcUtils;
  initialValues?: Partial<LessonPlanState>;
}) => {
  const lessonPlanStore = createStore<LessonPlanState>((set, get) => ({
    id,
    lessonPlan: {},
    iteration: undefined,
    isAcceptingChanges: false,
    isShared: false,
    scrollToSection: null,

    ...initialPerMessageState,

    actions: {
      // Setters
      setScrollToSection: (sectionKey) => set({ scrollToSection: sectionKey }),

      // Action functions
      messageStarted: () => {
        log.info("Message started");
        set({
          isAcceptingChanges: true,
        });
      },
      messagesUpdated: handleMessagesUpdated(set, get),
      messageFinished: () => {
        log.info("Message finished");
        set({ isAcceptingChanges: false, ...initialPerMessageState });
        // TODO: check timing and race conditions
        // handleTrackingEvents(lessonPlanTracking, getStore, get);
        // TODO: should we refetch when we start moderating?
        void handleRefetch(set, get, trpcUtils)();
      },
      refetch: handleRefetch(set, get, trpcUtils),
      resetStore: () => set({ lessonPlan: {} }),
    },

    ...initialValues,
  }));

  logStoreUpdates(lessonPlanStore, "lessons:store");
  return lessonPlanStore;
};
