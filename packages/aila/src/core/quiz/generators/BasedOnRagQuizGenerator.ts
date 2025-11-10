import { aiLogger } from "@oakai/logger";

import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizV1,
} from "../../../protocol/schema";
import type { QuizQuestionPool, QuizQuestionWithRawJson } from "../interfaces";
import { BaseQuizGenerator } from "./BaseQuizGenerator";

const log = aiLogger("aila:quiz");

// RAG-based Quiz Generator
export class BasedOnRagQuizGenerator extends BaseQuizGenerator {
  async generateMathsStarterQuizCandidates(
    lessonPlan: PartialLessonPlan,
    _ailaRagRelevantLessons?: AilaRagRelevantLesson[],
  ): Promise<QuizQuestionPool[]> {
    log.info(
      "Generating maths starter quiz for lesson plan id:",
      lessonPlan.basedOn?.id,
    );
    if (!lessonPlan.basedOn?.id) {
      log.info("Lesson plan basedOn is undefined. Returning empty array.");
      return [];
    }
    const questions = await this.questionArrayFromPlanId(
      lessonPlan.basedOn.id,
      "/starterQuiz",
    );
    return [
      {
        questions,
        source: {
          type: "basedOn",
          lessonPlanId: lessonPlan.basedOn.id,
          lessonTitle: lessonPlan.basedOn.title || "Based on lesson",
        },
      } satisfies QuizQuestionPool,
    ];
  }

  async generateMathsExitQuizCandidates(
    lessonPlan: PartialLessonPlan,
    _ailaRagRelevantLessons?: AilaRagRelevantLesson[],
  ): Promise<QuizQuestionPool[]> {
    log.info(
      "Generating maths exit quiz for lesson plan id:",
      lessonPlan.basedOn?.id,
    );
    if (!lessonPlan.basedOn?.id) {
      log.info("Lesson plan basedOn is undefined. Returning empty array.");
      return [];
    }
    const questions = await this.questionArrayFromPlanId(
      lessonPlan.basedOn.id,
      "/exitQuiz",
    );
    return [
      {
        questions,
        source: {
          type: "basedOn",
          lessonPlanId: lessonPlan.basedOn.id,
          lessonTitle: lessonPlan.basedOn.title || "Based on lesson",
        },
      } satisfies QuizQuestionPool,
    ];
  }
}
