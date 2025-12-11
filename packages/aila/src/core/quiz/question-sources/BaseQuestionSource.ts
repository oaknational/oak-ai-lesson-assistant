import { prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
} from "../../../protocol/schema";
import type { Task } from "../instrumentation";
import type {
  QuestionSource,
  QuizQuestionPool,
  RagQuizQuestion,
} from "../interfaces";
import { ElasticLessonQuizLookup } from "../services/LessonSlugQuizLookup";
import { QuizQuestionRetrievalService } from "../services/QuizQuestionRetrievalService";

const log = aiLogger("aila:quiz");

/**
 * Base abstract class for question sources.
 * Sources return structured candidate pools of questions from various origins.
 */
export abstract class BaseQuestionSource implements QuestionSource {
  abstract readonly name: string;

  private quizLookup = new ElasticLessonQuizLookup();
  protected retrievalService = new QuizQuestionRetrievalService();

  abstract getExitQuizCandidates(
    lessonPlan: PartialLessonPlan,
    relevantLessons: AilaRagRelevantLesson[],
    task: Task,
  ): Promise<QuizQuestionPool[]>;

  abstract getStarterQuizCandidates(
    lessonPlan: PartialLessonPlan,
    relevantLessons: AilaRagRelevantLesson[],
    task: Task,
  ): Promise<QuizQuestionPool[]>;

  /**
   * Get quiz questions for a lesson plan by its ID.
   * Looks up the lesson slug, finds question IDs, and retrieves full questions.
   */
  protected async questionArrayFromPlanId(
    planId: string,
    quizType: QuizPath,
  ): Promise<RagQuizQuestion[]> {
    const lessonPlan = await prisma.ragLessonPlan.findUnique({
      where: { id: planId },
    });

    if (!lessonPlan?.oakLessonSlug) {
      log.warn("Lesson plan not found for planId:", planId);
      throw new Error("Lesson slug not found for planId: " + planId);
    }

    const questionIds =
      quizType === "/starterQuiz"
        ? await this.quizLookup.getStarterQuiz(lessonPlan.oakLessonSlug)
        : await this.quizLookup.getExitQuiz(lessonPlan.oakLessonSlug);

    return this.retrievalService.retrieveQuestionsByIds(questionIds);
  }
}
