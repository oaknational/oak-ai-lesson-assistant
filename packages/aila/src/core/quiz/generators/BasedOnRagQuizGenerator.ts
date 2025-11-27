import { aiLogger } from "@oakai/logger";

import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
  QuizV1,
} from "../../../protocol/schema";
import type { QuizQuestionPool } from "../interfaces";
import { BaseQuizGenerator } from "./BaseQuizGenerator";

const log = aiLogger("aila:quiz");

// RAG-based Quiz Generator
export class BasedOnRagQuizGenerator extends BaseQuizGenerator {
  private async generateQuizCandidates(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<QuizQuestionPool[]> {
    log.info(
      `Generating maths ${quizType} for lesson plan id:`,
      lessonPlan.basedOn?.id,
    );
    if (!lessonPlan.basedOn?.id) {
      log.info("Lesson plan basedOn is undefined. Returning empty array.");
      return [];
    }
    const questions = await this.questionArrayFromPlanId(
      lessonPlan.basedOn.id,
      quizType,
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

  async generateMathsStarterQuizCandidates(
    lessonPlan: PartialLessonPlan,
    _ailaRagRelevantLessons?: AilaRagRelevantLesson[],
  ): Promise<QuizQuestionPool[]> {
    return this.generateQuizCandidates(lessonPlan, "/starterQuiz");
  }

  async generateMathsExitQuizCandidates(
    lessonPlan: PartialLessonPlan,
    _ailaRagRelevantLessons?: AilaRagRelevantLesson[],
  ): Promise<QuizQuestionPool[]> {
    return this.generateQuizCandidates(lessonPlan, "/exitQuiz");
  }
}
