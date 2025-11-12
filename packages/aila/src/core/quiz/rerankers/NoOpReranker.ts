import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import type {
  AilaQuizReranker,
  QuizQuestionPool,
  RatingResponse,
} from "../interfaces";

/**
 * No-op reranker for composer architecture
 *
 * Returns empty ratings since the composer doesn't use reranker output.
 * Allows configuring a quiz service with a composer selector
 * without needing actual reranking.
 */
export class NoOpReranker implements AilaQuizReranker {
  public async evaluateQuizArray(
    questionPools: QuizQuestionPool[],
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<RatingResponse[]> {
    // Return empty array - composer ignores ratings anyway
    return [];
  }
}
