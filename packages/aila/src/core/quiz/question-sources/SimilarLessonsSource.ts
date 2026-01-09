import { aiLogger } from "@oakai/logger";

import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
} from "../../../protocol/schema";
import type { QuestionSource, QuizQuestionPool } from "../interfaces";
import type { Task } from "../reporting";
import { QuizQuestionRetrievalService } from "../services/QuizQuestionRetrievalService";

const log = aiLogger("aila:quiz");

/**
 * Maximum number of similar lessons to use for quiz question candidates.
 * Each lesson typically has 6 questions, so 3 lessons = ~18 candidates.
 * We limit this to avoid flooding the composer with lower-relevance candidates.
 */
const MAX_SIMILAR_LESSONS = 3;

/**
 * Retrieves quiz questions from similar Oak lessons,
 * identified by matching title, subject, and key stage.
 */
export class SimilarLessonsSource implements QuestionSource {
  readonly name = "similarLessons";

  private retrievalService: QuizQuestionRetrievalService;
  private maxLessons: number;

  constructor(
    retrievalService?: QuizQuestionRetrievalService,
    maxLessons: number = MAX_SIMILAR_LESSONS,
  ) {
    this.retrievalService =
      retrievalService ?? new QuizQuestionRetrievalService();
    this.maxLessons = maxLessons;
  }

  async poolsFromSimilarLessons(
    similarLessons: AilaRagRelevantLesson[],
    quizType: QuizPath,
  ): Promise<QuizQuestionPool[]> {
    const lessonsToUse = similarLessons.slice(0, this.maxLessons);
    log.info(
      `Using ${lessonsToUse.length}/${similarLessons.length} similar lessons for quiz candidates:`,
      lessonsToUse.map((lesson) => "\n- " + lesson.title),
    );
    const poolPromises = lessonsToUse.map(async (lesson) => {
      const questions = await this.retrievalService.getQuestionsForPlanId(
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
