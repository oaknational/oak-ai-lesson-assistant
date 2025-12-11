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
 * Retrieves quiz questions from similar Oak lessons,
 * identified by matching title, subject, and key stage.
 */
export class SimilarLessonsSource extends BaseQuestionSource {
  readonly name = "similarLessons";

  async poolsFromSimilarLessons(
    similarLessons: AilaRagRelevantLesson[],
    quizType: QuizPath,
  ): Promise<QuizQuestionPool[]> {
    log.info(
      "Getting quizzes from similar lessons:",
      similarLessons.map((lesson) => "\n- " + lesson.title),
    );
    const poolPromises = similarLessons.map(async (lesson) => {
      const questions = await this.questionArrayFromPlanId(
        lesson.lessonPlanId,
        quizType,
      );
      if (questions.length === 0) {
        return null;
      }
      return {
        questions,
        source: {
          type: "similarLessons" as const,
          lessonPlanId: lesson.lessonPlanId,
          lessonTitle: lesson.title,
        },
      } satisfies QuizQuestionPool;
    });

    const pools = await Promise.all(poolPromises);
    return pools.filter((pool) => pool !== null);
  }

  async getStarterQuizCandidates(
    _lessonPlan: PartialLessonPlan,
    similarLessons: AilaRagRelevantLesson[],
    _task: Task,
  ): Promise<QuizQuestionPool[]> {
    return await this.poolsFromSimilarLessons(similarLessons, "/starterQuiz");
  }

  async getExitQuizCandidates(
    _lessonPlan: PartialLessonPlan,
    similarLessons: AilaRagRelevantLesson[],
    _task: Task,
  ): Promise<QuizQuestionPool[]> {
    return await this.poolsFromSimilarLessons(similarLessons, "/exitQuiz");
  }
}
