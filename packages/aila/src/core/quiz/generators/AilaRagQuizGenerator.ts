import { aiLogger } from "@oakai/logger";

import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
} from "../../../protocol/schema";
import type {
  AilaQuizCandidateGenerator,
  QuizQuestionPool,
} from "../interfaces";
import { RagQuizRetrievalService } from "../services/RagQuizRetrievalService";

const log = aiLogger("aila:quiz");

/**
 * Generates quiz candidates based on AILA RAG relevant lessons.
 */
export class AilaRagQuizGenerator implements AilaQuizCandidateGenerator {
  readonly name = "ailaRag";

  private retrievalService: RagQuizRetrievalService;

  constructor(retrievalService?: RagQuizRetrievalService) {
    this.retrievalService = retrievalService ?? new RagQuizRetrievalService();
  }

  async poolsFromAilaRagRelevantLessons(
    ailaRagRelevantLessons: AilaRagRelevantLesson[],
    quizType: QuizPath,
  ): Promise<QuizQuestionPool[]> {
    log.info(
      "Getting quizzes for relevant lessons:",
      ailaRagRelevantLessons.map((lesson) => "\n- " + lesson.title),
    );

    // TODO: MG - This is a load of DB queries and may make it spiky.
    const poolPromises = ailaRagRelevantLessons.map(async (relevantLesson) => {
      const questions = await this.retrievalService.getQuestionsForPlanId(
        relevantLesson.lessonPlanId,
        quizType,
      );
      if (questions.length === 0) {
        return null;
      }
      return {
        questions,
        source: {
          type: "ailaRag" as const,
          lessonPlanId: relevantLesson.lessonPlanId,
          lessonTitle: relevantLesson.title,
        },
      } satisfies QuizQuestionPool;
    });

    const pools = await Promise.all(poolPromises);
    return pools.filter((pool) => pool !== null);
  }

  async generateMathsStarterQuizCandidates(
    lessonPlan: PartialLessonPlan,
    ailaRagRelevantLessons: AilaRagRelevantLesson[],
  ): Promise<QuizQuestionPool[]> {
    return await this.poolsFromAilaRagRelevantLessons(
      ailaRagRelevantLessons,
      "/starterQuiz",
    );
  }

  async generateMathsExitQuizCandidates(
    lessonPlan: PartialLessonPlan,
    ailaRagRelevantLessons: AilaRagRelevantLesson[],
  ): Promise<QuizQuestionPool[]> {
    return await this.poolsFromAilaRagRelevantLessons(
      ailaRagRelevantLessons,
      "/exitQuiz",
    );
  }
}
