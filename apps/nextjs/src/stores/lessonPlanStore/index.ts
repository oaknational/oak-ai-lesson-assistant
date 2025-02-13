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
  isShared: boolean;
  scrollToSection: LessonPlanKey | null;

  // setters
  setScrollToSection: (sectionKey: LessonPlanKey | null) => void;

  // actions
  messageStarted: () => void;
  messagesUpdated: (messages: AiMessage[]) => void;
  messageFinished: () => void;
  refetch: () => Promise<void>;
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
    isShared: false,
    scrollToSection: null,

    ...initialPerMessageState,

    // Setters
    setScrollToSection: (sectionKey) => set({ scrollToSection: sectionKey }),

    // Action functions
    messageStarted: () => {
      log.info("Message started");
      set({ isAcceptingChanges: true });
    },
    messagesUpdated: handleMessagesUpdated(set, get),
    messageFinished: () => {
      log.info("Message finished");
      set({ isAcceptingChanges: false, ...initialPerMessageState });
      // TODO: should we refetch when we start moderating?
      void handleRefetch(set, get, trpc)();
    },
    refetch: handleRefetch(set, get, trpc),

    ...initialValues,
  }));

  logStoreUpdates(lessonPlanStore, "lessons:store");
  return lessonPlanStore;
};
