import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import { create } from "zustand";

import type { AiMessage } from "../chatStore/types";
import { handleMessagesUpdated } from "./stateActionFunctions/handleMessagesUpdated";

const log = aiLogger("lessons:store");

export type LessonPlanStore = {
  lessonPlan: LooseLessonPlan | null;
  // NOTE: https://zustand.docs.pmnd.rs/guides/maps-and-sets-usage
  appliedPatchHashes: Set<string>;
  iteration: number | undefined;

  messagesUpdated: (messages: AiMessage[], isLoading: boolean) => void;
};

export const useLessonPlanStore = create<LessonPlanStore>((set, get) => ({
  lessonPlan: null,
  appliedPatchHashes: new Set(),
  iteration: undefined,

  // Setters
  // NOTE: lessonPlanManager does a deep clone here
  setInitialLessonPlan: (lessonPlan: LooseLessonPlan) => set({ lessonPlan }),

  // Action functions
  messagesUpdated: handleMessagesUpdated(set, get), // NOT USED
}));

useLessonPlanStore.subscribe((state) => {
  log.info("State updated", state);
});
