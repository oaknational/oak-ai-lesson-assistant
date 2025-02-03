import { aiLogger } from "@oakai/logger";
import { kv } from "@vercel/kv";
import { pick } from "remeda";
import { Md5 } from "ts-md5";
import type { z } from "zod";

import type {
  LooseLessonPlan,
  QuizPath,
  QuizQuestion,
} from "../../../protocol/schema";
import { type BaseType } from "../ChoiceModels";
// import { evaluateQuiz } from "../OpenAIRanker";
import type { AilaQuizReranker } from "../interfaces";

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

  public abstract evaluateQuizArray(
    quizArray: QuizQuestion[][],
    lessonPlan: LooseLessonPlan,
    ratingSchema: T,
    quizType: QuizPath,
  ): Promise<z.infer<T>[]>;

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
