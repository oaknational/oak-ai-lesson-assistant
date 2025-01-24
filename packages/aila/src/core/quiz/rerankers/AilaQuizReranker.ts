import { aiLogger } from "@oakai/logger";
import { kv } from "@vercel/kv";
import type { ParsedChatCompletion } from "openai/resources/beta/chat/completions.mjs";
import { pick } from "remeda";
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

    const outputRatings = await processArray<
      QuizQuestion[],
      ParsedChatCompletion<T>
    >(quizArray, delayedRetrieveQuiz);
    const extractedOutputRatings = outputRatings.map((item): T => {
      if (item instanceof Error) {
        throw item;
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

    // create hash from relevant data - if one of these change due to user input then the quiz will be regenerated. Potentially this will slow down subsequent patches at the end of the lesson.
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

    await kv.set(cacheKey, evaluatedQuizzes, {
      ex: 60 * 5,
    });
    return evaluatedQuizzes;
  }
}
