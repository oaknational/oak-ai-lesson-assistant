import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import type {
  AilaQuizReranker,
  QuizQuestionPool,
  RatingResponse,
} from "../interfaces";

// This reranker returns the first quiz in the list. It is used for testing and hacky workarounds.
export class ReturnFirstReranker implements AilaQuizReranker {
  public evaluateQuizArray(
    questionPools: QuizQuestionPool[],
    _lessonPlan: PartialLessonPlan,
    _quizType: QuizPath,
  ): Promise<RatingResponse[]> {
    const output = questionPools.map((_, i) => {
      if (i === 0) {
        return {
          rating: 1,
          justification: "This is the first quiz.",
        };
      }
      return {
        rating: 0,
        justification: "This is not the first quiz.",
      };
    });

    return Promise.resolve(output);
  }
}
