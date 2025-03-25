import type { OakOpenAiLessonSummary } from "documents/schemas/oakOpenApi";

import type { LooseLessonPlan } from "../../aila/src/protocol/schema";

export function mapOpenApiLessonToAilaLesson(
  lessonData: OakOpenAiLessonSummary,
): Partial<LooseLessonPlan> {
  return {
    title: lessonData.lessonTitle,
    keyStage: lessonData.keyStageSlug,
    subject: lessonData.subjectTitle,
    topic: lessonData.unitTitle,
    learningOutcome: lessonData.pupilLessonOutcome,
    learningCycles: [],
    priorKnowledge: [],
    keyLearningPoints: lessonData.keyLearningPoints.map(
      (point) => point.keyLearningPoint,
    ),
    misconceptions: lessonData.misconceptionsAndCommonMistakes.map(
      (misconception) => {
        return {
          misconception: misconception.misconception,
          description: misconception.response,
        };
      },
    ),
    keywords: lessonData.lessonKeywords.map((keyword) => {
      return {
        keyword: keyword.keyword,
        definition: keyword.description,
      };
    }),
    basedOn: undefined,
    starterQuiz: [],
    exitQuiz: [],
    additionalMaterials: "",
  };
}
