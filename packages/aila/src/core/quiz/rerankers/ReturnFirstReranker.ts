import { generateMock } from "@anatine/zod-mock";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import type {
  AilaQuizReranker,
  QuizQuestionPool,
} from "../interfaces";
import {
  type RatingResponse,
  ratingResponseSchema,
} from "./RerankerStructuredOutputSchema";

// This reranker returns the first quiz in the list. It is used for testing and hacky workarounds.
export class ReturnFirstReranker implements AilaQuizReranker {
  public evaluateQuizArray(
    questionPools: QuizQuestionPool[],
    _lessonPlan: PartialLessonPlan,
    _quizType: QuizPath,
  ): Promise<RatingResponse[]> {
    const output = questionPools.map(() => {
      const dummySchema = generateMock(ratingResponseSchema);
      dummySchema.rating = 0;
      return dummySchema;
    });

    if (output[0]) {
      output[0].rating = 1;
    }

    return Promise.resolve(output);
  }
}
