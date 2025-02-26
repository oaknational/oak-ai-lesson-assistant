import { aiLogger } from "@oakai/logger";
import { createStore } from "zustand";

import type { LessonPlanTrackingContextProps } from "@/lib/analytics/lessonPlanTrackingContext";
import type { TrpcUtils } from "@/utils/trpc";

import type { GetStore } from "../AilaStoresProvider";
import { logStoreUpdates } from "../zustandHelpers";
import { handleMessagesUpdated } from "./stateActionFunctions/handleMessagesUpdated";
import { handleRefetch } from "./stateActionFunctions/handleRefetch";
import { handleTrackingEvents } from "./stateActionFunctions/handleTrackingEvents";
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
  lessonPlanTracking,
  getStore,
  initialValues,
}: {
  id: string;
  trpcUtils: TrpcUtils;
  getStore: GetStore;
  lessonPlanTracking: LessonPlanTrackingContextProps;
  initialValues?: Partial<LessonPlanState>;
}) => {
  const lessonPlanStore = createStore<LessonPlanState>((set, get) => ({
    id,
    lessonPlan: {},
    iteration: undefined,
    isAcceptingChanges: false,
    lastLessonPlan: {},
    isShared: false,
    scrollToSection: null,

    ...initialPerMessageState,

    // Setters
    setScrollToSection: (sectionKey) => set({ scrollToSection: sectionKey }),

    // Action functions
    messageStarted: () => {
      log.info("Message started");
      set({
        isAcceptingChanges: true,
        lastLessonPlan: get().lessonPlan,
      });
    },
    messagesUpdated: handleMessagesUpdated(set, get),
    messageFinished: () => {
      log.info("Message finished");
      set({ isAcceptingChanges: false, ...initialPerMessageState });
      handleTrackingEvents(lessonPlanTracking, getStore, get);
      // TODO: should we refetch when we start moderating?
      void handleRefetch(set, get, trpcUtils)();
    },
    refetch: handleRefetch(set, get, trpcUtils),
    resetStore: () => set({ lessonPlan: {} }),

    ...initialValues,
  }));

  logStoreUpdates(lessonPlanStore, "lessons:store");
  return lessonPlanStore;
};
