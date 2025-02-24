import type {
  LessonPlanKey,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import type { StoreApi } from "zustand";

import type { AiMessage } from "../chatStore/types";

export type LessonPlanState = {
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

export type LessonPlanSetter = StoreApi<LessonPlanState>["setState"];
export type LessonPlanGetter = StoreApi<LessonPlanState>["getState"];
