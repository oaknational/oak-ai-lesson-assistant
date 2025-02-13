import type {
  LessonPlanKey,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import { createStore } from "zustand";

import type { TrpcUtils } from "@/utils/trpc";

import type { AiMessage } from "../chatStore/types";
import { logStoreUpdates } from "../zustandHelpers";
import { handleMessagesUpdated } from "./stateActionFunctions/handleMessagesUpdated";
import { handleRefetch } from "./stateActionFunctions/handleRefetch";

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

  messageStarted: () => void;
  messagesUpdated: (messages: AiMessage[]) => void;
  messageFinished: () => void;
  refetch: () => Promise<void>;
  getState: () => LessonPlanStore;
};

const initialPerMessageState = {
  sectionsToEdit: [],
  appliedPatchHashes: [],
  appliedPatchPaths: [],
  numberOfStreamedCompleteParts: 0,
} satisfies Partial<LessonPlanStore>;

export const createLessonPlanStore = (
  id: string,
  trpc: TrpcUtils,
  initialValues: Partial<LessonPlanStore> = {},
) => {
  const lessonPlanStore = createStore<LessonPlanStore>((set, get) => ({
    id,
    lessonPlan: {},
    iteration: undefined,
    isAcceptingChanges: false,
    lastLessonPlan: {},
    isShared: false,

    ...initialPerMessageState,

    // Setters
    setInitialLessonPlan: (lessonPlan: LooseLessonPlan) => set({ lessonPlan }),

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
      // TODO: should we refetch when we start moderating?
      void handleRefetch(set, get, trpc)();
    },
    refetch: handleRefetch(set, get, trpc),

    getState: () => get(),

    ...initialValues,
  }));

  // For early state debugging. Remove later
  lessonPlanStore.subscribe((state) => {
    log.info("sectionsToEdit ", state.sectionsToEdit);
    log.info("appliedPatchPaths ", state.appliedPatchPaths);
  });

  logStoreUpdates(lessonPlanStore, "lessons:store");
  return lessonPlanStore;
};
