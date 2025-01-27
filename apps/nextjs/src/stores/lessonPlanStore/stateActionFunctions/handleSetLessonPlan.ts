import type {
  LessonPlanKey,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";

import type { LessonPlanStore } from "..";

const log = aiLogger("lessons:store");

const getKeyNames = (lessonPlan: LooseLessonPlan) =>
  (Object.keys(lessonPlan) as LessonPlanKey[]).filter((k) => lessonPlan[k]);

const logKeys = (
  currentLessonPlan: LooseLessonPlan,
  newLessonPlan: LooseLessonPlan,
  currentIteration: number | undefined,
  newIteration: number | undefined,
) => {
  const currentKeys = getKeyNames(currentLessonPlan);
  const newKeys = getKeyNames(newLessonPlan);
  log.info("Updating lesson plan from server", {
    iteration: currentIteration,
    newIteration,
    keys: newKeys.length,
    currentKeys: currentKeys.join("|"),
    newKeys: newKeys.join("|"),
  });
  if (newKeys.length < currentKeys.length) {
    log.warn(
      `New lesson plan has fewer keys than current lesson plan: ${newKeys.length} < ${currentKeys.length}`,
    );
  }
};

export const handleSetLessonPlan =
  (
    set: (partial: Partial<LessonPlanStore>) => void,
    get: () => LessonPlanStore,
  ) =>
  (newLessonPlan: LooseLessonPlan, newIteration: number | undefined) => {
    const { iteration: currentIteration, lessonPlan } = get();

    const validIteration =
      newIteration === undefined ||
      currentIteration === undefined ||
      newIteration > currentIteration;
    if (!validIteration) {
      log.info(
        `Skipping setting lesson plan with iteration ${newIteration} because current iteration is ${currentIteration}`,
      );
      return;
    }

    logKeys(lessonPlan, newLessonPlan, currentIteration, newIteration);
    set({
      lessonPlan: newLessonPlan,
      iteration: newIteration,
    });
  };
