import { aiLogger } from "@oakai/logger";
import { kv } from "@vercel/kv";
import { Md5 } from "ts-md5";

import type {
  LooseLessonPlan,
  QuizPath,
  QuizQuestion,
} from "../../../protocol/schema";
import { type BaseSchema } from "../ChoiceModels";
import { evaluateQuiz } from "../OpenAIRanker";
import { processArray, withRandomDelay } from "../apiCallingUtils";
import type { AilaQuizReranker } from "../interfaces";

const log = aiLogger("aila:quiz");
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
    // In this case the output is coming from the openAI endpoint. We need to unpack the output and unparse it.

    const outputRatings: any[] = await processArray(
      quizArray,
      delayedRetrieveQuiz,
    );
    const extractedOutputRatings = outputRatings.map(
      (item) => item.choices[0].message.parsed,
    );
    // const event = completion.choices[0].message.parsed;

    // const bestRating = selectHighestRated(outputRatings, (item) => item.rating);
    return extractedOutputRatings;
  }

  public async cachedEvaluateQuizArray(
    quizArray: QuizQuestion[][],
    lessonPlan: LooseLessonPlan,
    ratingSchema: typeof BaseSchema,
    quizType: QuizPath,
  ): Promise<T[]> {
    const keyPrefix = "aila:quiz:openai:reranker";
    const lessonPlanRerankerFields: string[] = [
      "title",
      "topic",
      "learningOutcome",
      "keyLearningPoints",
    ];

    // Extract only the relevant fields from lesson plan
    const relevantLessonPlanData = lessonPlanRerankerFields.reduce(
      (acc, field) => {
        acc[field] = lessonPlan[field as keyof LooseLessonPlan];
        return acc;
      },
      {} as Record<string, unknown>,
    );

    // Create hash from relevant data
    const hash = Md5.hashStr(
      JSON.stringify({
        quizArray,
        relevantLessonPlanData,
        ratingSchema,
        quizType,
      }),
    );
    const cacheKey = `${keyPrefix}:${hash}`;

    try {
      const cached = await kv.get<T[]>(cacheKey);
      if (cached) {
        log.info(`Cache hit for key: ${cacheKey}`);
        return cached;
      }
    } catch (e) {
      log.error(`Error getting cached value for key: ${cacheKey}`, e);
      await kv.del(cacheKey); // Remove potentially corrupted cache entry
    }

    log.info(`Cache miss for key: ${cacheKey}, evaluating for openAI`);
    const evaluatedQuizzes = await this.evaluateQuizArray(
      quizArray,
      lessonPlan,
      ratingSchema,
      quizType,
    );

    // Cache the results
    await kv.set(cacheKey, evaluatedQuizzes, {
      ex: 60 * 5,
    });
    return evaluatedQuizzes;
  }
}
