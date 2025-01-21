import { aiLogger } from "@oakai/logger";
import { kv } from "@vercel/kv";
import { pick } from "remeda";
import { Md5 } from "ts-md5";

import type {
  LooseLessonPlan,
  QuizPath,
  QuizQuestion,
} from "../../../protocol/schema";
import { type BaseSchema } from "../ChoiceModels";
// import { evaluateQuiz } from "../OpenAIRanker";
import { processArray, withRandomDelay } from "../apiCallingUtils";
import type { AilaQuizReranker } from "../interfaces";

const log = aiLogger("aila:quiz");
export abstract class BasedOnRagAilaQuizReranker<T extends typeof BaseSchema>
  implements AilaQuizReranker<T>
{
  abstract rerankQuiz(quizzes: QuizQuestion[][]): Promise<number[]>;
  public ratingSchema?: T;
  public quizType?: QuizPath;

  constructor(ratingSchema?: T, quizType?: QuizPath) {
    this.ratingSchema = ratingSchema;
    this.quizType = quizType;
  }

  //  This takes a quiz array and evaluates it using the rating schema and quiz type and returns an array of evaluation schema objects.
  //   TODO: GCLOMAX - move evaluate quiz out to use dependancy injection - can then pass the different types of reranker types.
  public async evaluateQuizArray(
    quizArray: QuizQuestion[][],
    lessonPlan: LooseLessonPlan,
    ratingSchema: typeof BaseSchema,
    quizType: QuizPath,
  ): Promise<T[]> {
    // Placeholder implementation
    const mockRatings = quizArray.map(() => ({
      rating: Math.random() * 10,
      explanation: "Placeholder rating explanation",
    }));

    return mockRatings as unknown as T[];
  }

  public async cachedEvaluateQuizArray(
    quizArray: QuizQuestion[][],
    lessonPlan: LooseLessonPlan,
    ratingSchema: typeof BaseSchema,
    quizType: QuizPath,
  ): Promise<T[]> {
    const keyPrefix = "aila:quiz:openai:reranker";
    const lessonPlanRerankerFields = [
      "title",
      "topic",
      "learningOutcome",
      "keyLearningPoints",
    ] as const;

    const relevantLessonPlanData = pick(lessonPlan, lessonPlanRerankerFields);

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
