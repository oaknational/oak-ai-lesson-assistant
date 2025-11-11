import { aiLogger } from "@oakai/logger";

import { kv } from "@vercel/kv";
import type { ParsedChatCompletion } from "openai/resources/beta/chat/completions.mjs";
import pLimit from "p-limit";
import { pick } from "remeda";
import { Md5 } from "ts-md5";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import { evaluateQuiz, ratingResponseSchema } from "../OpenAIRanker";
import type {
  AilaQuizReranker,
  QuizQuestionPool,
  QuizQuestionWithRawJson,
  RatingResponse,
} from "../interfaces";

const log = aiLogger("aila:quiz");

const CONCURRENCY = 10;
const limiter = pLimit(CONCURRENCY);

export class AiEvaluatorQuizReranker implements AilaQuizReranker {
  public async evaluateQuizArray(
    questionPools: QuizQuestionPool[],
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
    useCache: boolean = true,
  ): Promise<RatingResponse[]> {
    if (useCache) {
      return this.cachedEvaluateQuizArray(questionPools, lessonPlan, quizType);
    }

    const outputRatings = await limiter.map(questionPools, async (pool) => {
      const result = await evaluateQuiz(
        lessonPlan,
        pool.questions,
        4000,
        ratingResponseSchema,
        quizType,
      );
      return result;
    });

    const extractedOutputRatings = outputRatings.map((item): RatingResponse => {
      if (item instanceof Error) {
        log.error("Failed to evaluate quiz:", item);
        // Return a default/fallback rating object.
        return {
          rating: 0,
          justification: `Error evaluating quiz: ${item.message}`,
        };
      }
      if (!item.choices?.[0]?.message?.parsed) {
        throw new Error("Missing parsed response from OpenAI");
      }
      return item.choices[0].message.parsed;
    });

    return extractedOutputRatings;
  }

  public async cachedEvaluateQuizArray(
    questionPools: QuizQuestionPool[],
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<RatingResponse[]> {
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
        questionPools,
        relevantLessonPlanData,
        ratingSchema: ratingResponseSchema,
        quizType,
      }),
    );
    const cacheKey = `${keyPrefix}:${hash}`;

    try {
      const cached = await kv.get<RatingResponse[]>(cacheKey);
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
      questionPools,
      lessonPlan,
      quizType,
      false,
    );

    await kv.set(cacheKey, evaluatedQuizzes, {
      ex: 60 * 10,
    });
    return evaluatedQuizzes;
  }
}
