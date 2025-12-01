import { aiLogger } from "@oakai/logger";

import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
} from "../../../protocol/schema";
import type { QuizQuestionPool } from "../interfaces";
import type { Span } from "../tracing";
import { BasedOnRagQuizGenerator } from "./BasedOnRagQuizGenerator";

const log = aiLogger("aila:quiz");

// This generates a quiz based on the *Underlying AILA RAG service* relevant lessons.
export class AilaRagQuizGenerator extends BasedOnRagQuizGenerator {
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
      const questions = await this.questionArrayFromPlanId(
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
    _lessonPlan: PartialLessonPlan,
    ailaRagRelevantLessons: AilaRagRelevantLesson[] = [],
    _span?: Span,
  ): Promise<QuizQuestionPool[]> {
    return await this.poolsFromAilaRagRelevantLessons(
      ailaRagRelevantLessons,
      "/starterQuiz",
    );
  }

  async generateMathsExitQuizCandidates(
    _lessonPlan: PartialLessonPlan,
    ailaRagRelevantLessons: AilaRagRelevantLesson[] = [],
    _span?: Span,
  ): Promise<QuizQuestionPool[]> {
    return await this.poolsFromAilaRagRelevantLessons(
      ailaRagRelevantLessons,
      "/exitQuiz",
    );
  }
}
