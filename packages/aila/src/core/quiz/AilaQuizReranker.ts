import type { z } from "zod";

import type { QuizPath, QuizQuestion } from "../../protocol/schema";
import type { LooseLessonPlan } from "../../protocol/schema";
import {
  selectHighestRated,
  type BaseType,
  type BaseSchema,
} from "./ChoiceModels";
import { evaluateQuiz } from "./OpenAIRanker";
import { processArray } from "./apiCallingUtils";
import { withRandomDelay } from "./apiCallingUtils";
import type { AilaQuizReranker } from "./interfaces";

export abstract class BasedOnRagAilaQuizReranker<T extends typeof BaseSchema>
  implements AilaQuizReranker<T>
{
  abstract rerankQuiz(quizzes: QuizQuestion[][]): Promise<number[]>;
  public ratingSchema?: T;
  public quizType?: QuizPath;

  //   TODO: GCLOMAX - we may not need this if going in the factory direction.
  constructor(ratingSchema?: T, quizType?: QuizPath) {
    this.ratingSchema = ratingSchema;
    this.quizType = quizType;
  }

  //  This takes a quiz array and evaluates it using the rating schema and quiz type and returns an array of evaluation schema objects.
  //   TODO: GCLOMAX - move evaluate quiz out to use dependancy injection - can then pass the different types of reranker types.
  //   TODO: GCLOMAX - Cache this. This is where a lot of the expensive openai calling takes place.
  public async evaluateQuizArray(
    quizArray: QuizQuestion[][],
    lessonPlan: LooseLessonPlan,
    ratingSchema: typeof BaseSchema,
    quizType: QuizPath,
  ): Promise<T[]> {
    // Decorates to delay the evaluation of each quiz. There is probably a better library for this.
    const delayedRetrieveQuiz = withRandomDelay(
      async (quiz: QuizQuestion[]) =>
        await evaluateQuiz(lessonPlan, quiz, 1500, ratingSchema, quizType),
      1000,
      5000,
    );
    // Process array allows async eval in parallel, the above decorator tries to prevent rate limiting.
    // TODO: GCLOMAX - make these generic types safer.
    const outputRatings = await processArray(quizArray, delayedRetrieveQuiz);
    // const bestRating = selectHighestRated(outputRatings, (item) => item.rating);
    return outputRatings;
  }
}
