import type {
  LessonPlanKey,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import { createStore } from "zustand";

import type { AiMessage } from "../chatStore/types";
import { logStoreUpdates } from "../zustandHelpers";
import { handleMessagesUpdated } from "./stateActionFunctions/handleMessagesUpdated";

const log = aiLogger("lessons:store");

export type LessonPlanStore = {
  lessonPlan: LooseLessonPlan;
  appliedPatchHashes: string[];
  appliedPatchPaths: LessonPlanKey[];
  sectionsToEdit: LessonPlanKey[];
  iteration: number | undefined;
  isAcceptingChanges: boolean;
  numberOfStreamedCompleteParts: number;

  messageStarted: () => void;
  messagesUpdated: (messages: AiMessage[]) => void;
  messageFinished: () => void;
};

const initialPerMessageState = {
  sectionsToEdit: [],
  appliedPatchHashes: [],
  appliedPatchPaths: [],
  numberOfStreamedCompleteParts: 0,
} satisfies Partial<LessonPlanStore>;

export const createLessonPlanStore = (
  initialValues: Partial<LessonPlanStore> = {},
) => {
  const lessonPlanStore = createStore<LessonPlanStore>((set, get) => ({
    lessonPlan: {},
    iteration: undefined,
    isAcceptingChanges: false,

    ...initialPerMessageState,

    // Setters
    setInitialLessonPlan: (lessonPlan: LooseLessonPlan) => set({ lessonPlan }),

    // Action functions
    messageStarted: () => {
      log.info("Message started");
      set({ isAcceptingChanges: true });
    },
    messagesUpdated: handleMessagesUpdated(set, get),
    messageFinished: () => {
      // TODO: time to refetch lesson plan from getChat?
      log.info("Message finished");
      set({ isAcceptingChanges: false, ...initialPerMessageState });
    },

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
