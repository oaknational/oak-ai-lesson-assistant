import type {
  LessonPlanKey,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import { createStore } from "zustand";

import type { LessonPlanTrackingContextProps } from "@/lib/analytics/lessonPlanTrackingContext";
import type { TrpcUtils } from "@/utils/trpc";

import type { GetStore } from "../AilaStoresProvider";
import type { AiMessage } from "../chatStore/types";
import { logStoreUpdates } from "../zustandHelpers";
import { handleMessagesUpdated } from "./stateActionFunctions/handleMessagesUpdated";
import { handleRefetch } from "./stateActionFunctions/handleRefetch";
import { handleTrackingEvents } from "./stateActionFunctions/handleTrackingEvents";

const log = aiLogger("lessons:store");

export type LessonPlanStore = {
  id: string;
  lessonPlan: LooseLessonPlan;
  appliedPatchHashes: string[];
  appliedPatchPaths: LessonPlanKey[];
  sectionsToEdit: LessonPlanKey[];
  iteration: number | undefined;
  isAcceptingChanges: boolean;
  numberOfStreamedCompleteParts: number;
  // Used for lessonPlanTracking.onStreamFinished
  lastLessonPlan: LooseLessonPlan;
  isShared: boolean;
  scrollToSection: LessonPlanKey | null;

  // setters
  setScrollToSection: (sectionKey: LessonPlanKey | null) => void;

  // actions
  messageStarted: () => void;
  messagesUpdated: (messages: AiMessage[]) => void;
  messageFinished: () => void;
  refetch: () => Promise<void>;
  resetStore: () => void;
};

const initialPerMessageState = {
  sectionsToEdit: [],
  appliedPatchHashes: [],
  appliedPatchPaths: [],
  numberOfStreamedCompleteParts: 0,
} satisfies Partial<LessonPlanStore>;

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
  initialValues?: Partial<LessonPlanStore>;
}) => {
  const lessonPlanStore = createStore<LessonPlanStore>((set, get) => ({
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
