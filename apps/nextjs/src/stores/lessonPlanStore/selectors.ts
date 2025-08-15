import type {
  LessonPlanKey,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { convertQuizV1ToV2 } from "@oakai/aila/src/protocol/schemas/quiz/conversion/quizV1ToV2";

import type { LessonPlanState } from "./index";

export const lessonPlanSectionSelector = (sectionKey: LessonPlanKey) => {
  return (
    state: LessonPlanState,
  ): LooseLessonPlan[LessonPlanKey] | undefined => {
    return state.lessonPlan[sectionKey];
  };
};

type SectionStatus = "empty" | "streaming" | "loaded";

export const sectionStatusSelector = (sectionKey: LessonPlanKey) => {
  return (state: LessonPlanState): SectionStatus => {
    const section = state.lessonPlan[sectionKey];

    const isStreaming =
      state.sectionsToEdit.includes(sectionKey) &&
      !state.appliedPatchPaths.includes(sectionKey);

    if (isStreaming) {
      return "streaming";
    }
    if (section) {
      return "loaded";
    }
    return "empty";
  };
};
