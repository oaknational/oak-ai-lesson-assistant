import type { z } from "zod";

import type {
  LooseLessonPlan,
  QuizQuestion,
  QuizPath,
} from "../../../protocol/schema";
import type { BaseSchema } from "../ChoiceModels";
import { populateZodSchema } from "../utils/schemaPopulator";
import { BasedOnRagAilaQuizReranker } from "./AilaQuizReranker";
import { testRatingSchema } from "./RerankerStructuredOutputSchema";

// This reranker returns the first quiz in the list. It is used for testing and hacky workarounds.
// TODO: GCLOMAX - Fix the typing here to be generic.
export class ReturnFirstReranker extends BasedOnRagAilaQuizReranker<
  typeof testRatingSchema
> {
  public rerankQuiz(quizzes: QuizQuestion[][]): Promise<number[]> {
    return Promise.resolve([0]);
  }
  public evaluateQuizArray(
    quizzes: QuizQuestion[][],
    lessonPlan: LooseLessonPlan,
    ratingSchema: typeof testRatingSchema,
    quizType: QuizPath,
  ): Promise<(typeof testRatingSchema)[]> {
    const output: z.infer<typeof testRatingSchema>[] = [];

    quizzes.forEach((quiz) => {
      const dummySchema = populateZodSchema(testRatingSchema);
      dummySchema.rating = 0;
      output.push(dummySchema);
    });
    if (output[0]) {
      output[0].rating = 1;
    }

    return Promise.resolve(output as any);
  }
}
