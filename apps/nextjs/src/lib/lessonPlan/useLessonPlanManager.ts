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

  useEffect(() => {
    const onLessonPlanUpdated = (updatedLessonPlan: LooseLessonPlan) => {
      log.info("Update lesson plan state", updatedLessonPlan);
      setLessonPlan(updatedLessonPlan);
    };

    lessonPlanManager.on("lessonPlanUpdated", onLessonPlanUpdated);

    return () => {
      lessonPlanManager.off("lessonPlanUpdated", onLessonPlanUpdated);
    };
  }, [lessonPlanManager]);

  return {
    lessonPlanManager,
    lessonPlan,
  };
}
