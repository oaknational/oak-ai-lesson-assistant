import type {
  LessonPlanKey,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import { create } from "zustand";

import { handleMessageUpdated } from "./stateActionFunctions/handleMessageUpdated";
import { handleSetLessonPlan } from "./stateActionFunctions/handleSetLessonPlan";

const log = aiLogger("lessons:store");

export type LessonPlanStore = {
  lessonPlan: LooseLessonPlan;
  // TODO: Don't use a set
  appliedPatchHashes: Set<string>;
  iteration: number | undefined;
};

export const useLessonPlanStore = create<LessonPlanStore>((set, get) => ({
  lessonPlan: null,
  appliedPatchHashes: new Set(),
  eventEmitter: new EventEmitter(),
  iteration: undefined,

  // Setters
  // NOTE: lessonPlanManager does a deep clone here
  setInitialLessonPlan: (lessonPlan: LooseLessonPlan) => set({ lessonPlan }),

  // Action functions
  messageUpdated: handleMessageUpdated,
  setLessonPlan: handleSetLessonPlan,
}));

useLessonPlanStore.subscribe((state) => {
  log.info("State updated", state);
});
