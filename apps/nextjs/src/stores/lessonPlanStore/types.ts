import type {
  LessonPlanKey,
  PartialLessonPlan,
} from "@oakai/aila/src/protocol/schema";

import type { StoreApi } from "zustand";

import type { AiMessage } from "../chatStore/types";

export type LessonPlanState = {
  id: string;
  lessonPlan: PartialLessonPlan;
  appliedPatchHashes: string[];
  appliedPatchPaths: LessonPlanKey[];
  sectionsToEdit: LessonPlanKey[];
  iteration: number | undefined;
  isAcceptingChanges: boolean;
  numberOfStreamedCompleteParts: number;
  isShared: boolean;
  scrollToSection: LessonPlanKey | null;

  actions: {
    // setters
    setScrollToSection: (sectionKey: LessonPlanKey | null) => void;

    // actions
    messageStarted: () => void;
    messagesUpdated: (messages: AiMessage[]) => void;
    messageFinished: () => void;
    refetch: () => Promise<void>;
    resetStore: () => void;
  };
};

export type LessonPlanSetter = StoreApi<LessonPlanState>["setState"];
export type LessonPlanGetter = StoreApi<LessonPlanState>["getState"];
