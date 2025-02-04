import { aiLogger } from "@oakai/logger";
import { kv } from "@vercel/kv";
import type { ParsedChatCompletion } from "openai/resources/beta/chat/completions.mjs";
import { pick } from "remeda";
import { Md5 } from "ts-md5";
import type { z } from "zod";

import type {
  LooseLessonPlan,
  QuizPath,
  QuizQuestion,
} from "../../../protocol/schema";
import { type BaseSchema, type BaseType } from "../ChoiceModels";
import { evaluateQuiz } from "../OpenAIRanker";
import { processArray, withRandomDelay } from "../apiCallingUtils";
import type { AilaQuizReranker } from "../interfaces";

// import { evaluateQuiz } from "../OpenAIRanker";

const log = aiLogger("aila:quiz");
export abstract class BasedOnRagAilaQuizReranker<T extends z.ZodType<BaseType>>
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
    ratingSchema: T,
    quizType: QuizPath,
  ): Promise<z.infer<T>[]> {
    // Decorates to delay the evaluation of each quiz. There is probably a better library for this.
    const delayedRetrieveQuiz = withRandomDelay<
      [QuizQuestion[]],
      ParsedChatCompletion<z.infer<T>>
    >(
      async (quiz: QuizQuestion[]) => {
        try {
          const result = await evaluateQuiz(
            lessonPlan,
            quiz,
            1500,
            ratingSchema,
            quizType,
          );
          if (result instanceof Error) {
            throw result;
          }
          return result as ParsedChatCompletion<z.infer<T>>;
        } catch (error) {
          throw error instanceof Error ? error : new Error(String(error));
        }
      },
      1000,
      5000,
    );
    // Process array allows async eval in parallel, the above decorator tries to prevent rate limiting.
    // TODO: GCLOMAX - make these generic types safer.
    // In this case the output is coming from the openAI endpoint. We need to unpack the output and unparse it.

    const outputRatings = await processArray<
      QuizQuestion[],
      ParsedChatCompletion<z.infer<T>>
    >(quizArray, delayedRetrieveQuiz);
    const extractedOutputRatings = outputRatings.map((item): z.infer<T> => {
      if (item instanceof Error) {
        log.error("Failed to evaluate quiz:", item);
        // TODO: GCLOMAX - When merged add zod-mock for this, then overwrite the rating to be zero given that the schema must always have a root rating field.
        // Return a default/fallback rating object that matches type T.
        return {
          rating: 0,
          reasoning: `Error evaluating quiz: ${item.message}`,
        } as z.infer<T>;
      }
      if (!item.choices?.[0]?.message?.parsed) {
        throw new Error("Missing parsed response from OpenAI");
      }
      return item.choices[0].message.parsed;
    });
    // const event = completion.choices[0].message.parsed;

    // const bestRating = selectHighestRated(outputRatings, (item) => item.rating);
    return extractedOutputRatings;
  }
  // public abstract evaluateQuizArray(
  //   quizArray: QuizQuestion[][],
  //   lessonPlan: LooseLessonPlan,
  //   ratingSchema: T,
  //   quizType: QuizPath,
  // ): Promise<z.infer<T>[]>;

  public async cachedEvaluateQuizArray(
    quizArray: QuizQuestion[][],
    lessonPlan: LooseLessonPlan,
    ratingSchema: T,
    quizType: QuizPath,
  ): Promise<z.infer<T>[]> {
    const keyPrefix = "aila:quiz:openai:reranker";
    const lessonPlanRerankerFields = [
      "title",
      "topic",
      "learningOutcome",
      "keyLearningPoints",
    ] as const;

    const relevantLessonPlanData = pick(lessonPlan, lessonPlanRerankerFields);

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
      const cached = await kv.get<z.infer<T>[]>(cacheKey);
      if (cached) {
        log.info(`Cache hit for key: ${cacheKey}`);
        return cached;
      }
    } catch (e) {
      log.error(`Error getting cached value for key: ${cacheKey}`, e);
      await kv.del(cacheKey);
    }

    log.info(`Cache miss for key: ${cacheKey}, evaluating for openAI`);
    const evaluatedQuizzes = await this.evaluateQuizArray(
      quizArray,
      lessonPlan,
      ratingSchema,
      quizType,
    );

    await kv.set(cacheKey, evaluatedQuizzes, {
      ex: 60 * 5,
    });
    return evaluatedQuizzes;
  }
}
