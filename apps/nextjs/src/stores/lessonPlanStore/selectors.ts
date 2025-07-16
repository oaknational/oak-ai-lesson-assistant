import type {
  LessonPlanKey,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { convertQuizV1ToV2 } from "@oakai/aila/src/protocol/schemas/quiz/conversion/quizV1ToV2";

import type { LessonPlanState } from "./index";

const sectionKeyOverrides = {
  starterQuiz: "_experimental_starterQuizMathsV0",
  exitQuiz: "_experimental_exitQuizMathsV0",
} as const;

export const lessonPlanSectionSelector = (sectionKey: LessonPlanKey) => {
  return (
    state: LessonPlanState,
  ): LooseLessonPlan[LessonPlanKey] | undefined => {
    if (sectionKey === "starterQuiz" || sectionKey === "exitQuiz") {
      const overriddenSection =
        state.lessonPlan[sectionKeyOverrides[sectionKey]];
      if (overriddenSection) {
        // Convert V1 experimental quiz to V2 format
        return convertQuizV1ToV2(overriddenSection);
      }
    }

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
