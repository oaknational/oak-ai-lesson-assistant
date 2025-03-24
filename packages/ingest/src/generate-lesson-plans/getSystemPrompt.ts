import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { LessonPlanJsonSchema } from "@oakai/aila/src/protocol/schema";
import { template } from "@oakai/core/src/prompts/lesson-assistant";

import type { RawLesson } from "../zod-schema/zodSchema";

export function getSystemPrompt({ rawLesson }: { rawLesson: RawLesson }) {
  const { lessonTitle, keyStageSlug, subjectSlug } = rawLesson;
  const lessonPlan: LooseLessonPlan = {
    title: lessonTitle,
    keyStage: keyStageSlug,
    subject: subjectSlug,
  };

  return template({
    lessonPlan,
    relevantLessonPlans: "None",
    summaries: "None",
    responseMode: "generate",
    lessonPlanJsonSchema: JSON.stringify(LessonPlanJsonSchema),
    llmResponseJsonSchema: "",
    isUsingStructuredOutput: true,
  });
}
