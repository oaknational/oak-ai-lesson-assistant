import { useEffect, useState } from "react";

import { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";

import { LessonPlanManager } from "./LessonPlanManager";

const log = aiLogger("lessons");

export function useLessonPlanManager(initialLessonPlan: LooseLessonPlan = {}) {
  const [lessonPlanManager] = useState(
    () => new LessonPlanManager(initialLessonPlan),
  );
  const [lessonPlan, setLessonPlan] = useState(
    lessonPlanManager.getLessonPlan(),
  );
  const [iteration, setIteration] = useState<number | undefined>(undefined);

  useEffect(() => {
    const onLessonPlanUpdated = ({
      lessonPlan: updatedLessonPlan,
      iteration: updatedIteration,
    }: {
      lessonPlan: LooseLessonPlan;
      iteration: number | undefined;
    }) => {
      log.info("Update lesson plan state", updatedLessonPlan);
      setLessonPlan(updatedLessonPlan);
      setIteration(updatedIteration);
    };

    lessonPlanManager.on("lessonPlanUpdated", onLessonPlanUpdated);

    return () => {
      lessonPlanManager.off("lessonPlanUpdated", onLessonPlanUpdated);
    };
  }, [lessonPlanManager]);

  return {
    lessonPlanManager,
    lessonPlan,
    iteration,
  };
}
