import React, { useMemo } from "react";

import { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";

export const LESSON_PLAN_SECTIONS = [
  { key: "title", title: "Title" },
  { key: "subject", title: "Subject" },
  { key: "keyStage", title: "Key Stage" },
  { key: "learningOutcome", title: "Learning Outcome" },
  { key: "learningCycles", title: "Learning Cycles" },
  { key: "priorKnowledge", title: "Prior Knowledge" },
  { key: "keyLearningPoints", title: "Key Learning Points" },
  { key: "misconceptions", title: "Misconceptions" },
  { key: "keywords", title: "Keywords" },
  { key: "starterQuiz", title: "Starter Quiz" },
  { key: "cycles", title: "Cycles 1-3" },
  { key: "exitQuiz", title: "Exit Quiz" },
  // { key: "additionalMaterials", title: "Additional Materials" }, Do not show the additional materials section
] as const;

export type LessonPlanSectionKey = (typeof LESSON_PLAN_SECTIONS)[number]["key"];

export type LessonPlanProgressBarProps = {
  lessonPlan: LooseLessonPlan;
};

export const lessonPlanSectionIsComplete = (
  lessonPlan: LooseLessonPlan,
  key: LessonPlanSectionKey,
) => {
  if (key === "cycles") {
    return lessonPlan.cycle1 && lessonPlan.cycle2 && lessonPlan.cycle3;
  }
  return lessonPlan[key] !== undefined && lessonPlan[key] !== null;
};

export const LessonPlanProgressBar: React.FC<LessonPlanProgressBarProps> = ({
  lessonPlan,
}) => {
  const completedSections = useMemo(() => {
    return LESSON_PLAN_SECTIONS.filter(({ key }) =>
      lessonPlanSectionIsComplete(lessonPlan, key),
    ).length;
  }, [lessonPlan]);

  return (
    <div className="flex items-center justify-center gap-10">
      <span className="flex items-center justify-center whitespace-nowrap text-base">
        {`${completedSections} of ${LESSON_PLAN_SECTIONS.length} sections`}
      </span>
      <span
        className={`
        relative h-8 w-full rounded-full bg-gray-200 
        `}
      >
        <span
          className={`
          absolute bottom-0 left-0 top-0 rounded-full bg-oakGreen
          `}
          style={{
            width: `${(completedSections / LESSON_PLAN_SECTIONS.length) * 100}%`,
          }}
        />
      </span>
    </div>
  );
};
