import type { LessonPlanKey } from "@oakai/aila/src/protocol/schema";

import type { LessonPlanStore } from "./index";

type SectionStatus = "empty" | "streaming" | "loaded";

export const sectionStatusSelector = (sectionKey: LessonPlanKey) => {
  return (state: LessonPlanStore): SectionStatus => {
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
