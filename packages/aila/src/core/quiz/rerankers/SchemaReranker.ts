import { aiLogger } from "@oakai/logger";

import type { z } from "zod";

import type {
  LooseLessonPlan,
  QuizPath,
  QuizQuestion,
} from "../../../protocol/schema";
import type { BaseType } from "../ChoiceModels";
import type { QuizQuestionWithRawJson } from "../interfaces";
import { BasedOnRagAilaQuizReranker } from "./AilaQuizReranker";
import { testRatingSchema } from "./RerankerStructuredOutputSchema";

const log = aiLogger("aila:quiz");

export class TestSchemaReranker<
  T extends z.ZodType<BaseType & Record<string, unknown>>,
> extends BasedOnRagAilaQuizReranker<T> {
  public rerankQuiz(quizzes: QuizQuestion[][]): Promise<number[]> {
    return Promise.resolve([]);
  }
  public inputSchema = testRatingSchema;
  public evaluateStarterQuiz(
    quizzes: QuizQuestionWithRawJson[][],
    lessonPlan: LooseLessonPlan,
    ratingSchema: T,
    quizType: QuizPath,
  ): Promise<z.infer<T>[]> {
    return this.evaluateQuizArray(quizzes, lessonPlan, ratingSchema, quizType);
  }
  public evaluateExitQuiz(
    quizzes: QuizQuestionWithRawJson[][],
    lessonPlan: LooseLessonPlan,
    ratingSchema: T,
    quizType: QuizPath,
  ): Promise<z.infer<T>[]> {
    return this.evaluateQuizArray(quizzes, lessonPlan, ratingSchema, quizType);
  }
}
