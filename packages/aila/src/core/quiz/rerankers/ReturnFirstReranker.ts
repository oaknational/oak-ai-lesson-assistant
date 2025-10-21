import { generateMock } from "@anatine/zod-mock";
import type { z } from "zod";

import type {
  PartialLessonPlan,
  QuizPath,
  QuizV1Question,
} from "../../../protocol/schema";
import { BasedOnRagAilaQuizReranker } from "./AilaQuizReranker";
import { ratingResponseSchema } from "./RerankerStructuredOutputSchema";

// This reranker returns the first quiz in the list. It is used for testing and hacky workarounds.
// TODO: GCLOMAX - Fix the typing here to be generic.
export class ReturnFirstReranker extends BasedOnRagAilaQuizReranker<
  typeof ratingResponseSchema
> {
  public rerankQuiz(quizzes: QuizV1Question[][]): Promise<number[]> {
    return Promise.resolve([0]);
  }
  public evaluateQuizArray(
    quizzes: QuizV1Question[][],
    _lessonPlan: PartialLessonPlan,
    ratingSchema: typeof ratingResponseSchema,
    _quizType: QuizPath,
  ): Promise<z.infer<typeof ratingResponseSchema>[]> {
    const output = quizzes.map(() => {
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
