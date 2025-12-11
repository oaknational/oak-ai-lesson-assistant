import { aiLogger } from "@oakai/logger";

import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
} from "../../../protocol/schema";
import type { Task } from "../instrumentation";
import type { QuizQuestionPool } from "../interfaces";
import { BaseQuestionSource } from "./BaseQuestionSource";

const log = aiLogger("aila:quiz");

/**
 * Retrieves quiz questions from the specific Oak lesson that the user
 * selected as the "based on" source for their lesson plan.
 * This is a high-signal source when available.
 */
export class BasedOnLessonSource extends BaseQuestionSource {
  readonly name = "basedOnLesson";

  private async getCandidates(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<QuizQuestionPool[]> {
    log.info(
      `Getting ${quizType} from basedOn lesson:`,
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
          type: "basedOnLesson",
          lessonPlanId: lessonPlan.basedOn.id,
          lessonTitle: lessonPlan.basedOn.title || "Based on lesson",
        },
      } satisfies QuizQuestionPool,
    ];
  }

  async getStarterQuizCandidates(
    lessonPlan: PartialLessonPlan,
    _similarLessons: AilaRagRelevantLesson[],
    _task: Task,
  ): Promise<QuizQuestionPool[]> {
    return this.getCandidates(lessonPlan, "/starterQuiz");
  }

  async getExitQuizCandidates(
    lessonPlan: PartialLessonPlan,
    _similarLessons: AilaRagRelevantLesson[],
    _task: Task,
  ): Promise<QuizQuestionPool[]> {
    return this.getCandidates(lessonPlan, "/exitQuiz");
  }
}
