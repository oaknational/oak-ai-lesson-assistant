import { aiLogger } from "@oakai/logger";

import type { z } from "zod";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import type { BaseType } from "../ChoiceModels";
import type { QuizQuestionWithRawJson } from "../interfaces";
import { BasedOnRagAilaQuizReranker } from "./AilaQuizReranker";
import { ratingResponseSchema } from "./RerankerStructuredOutputSchema";

const log = aiLogger("aila:quiz");

export class TestSchemaReranker<
  T extends z.ZodType<BaseType & Record<string, unknown>>,
> extends BasedOnRagAilaQuizReranker<T> {
  public rerankQuiz(quizzes: QuizQuestionWithRawJson[][]): Promise<number[]> {
    return Promise.resolve([]);
  }
  public inputSchema = ratingResponseSchema;
  public evaluateStarterQuiz(
    quizzes: QuizQuestionWithRawJson[][],
    lessonPlan: PartialLessonPlan,
    ratingSchema: T,
    quizType: QuizPath,
  ): Promise<z.infer<T>[]> {
    return this.evaluateQuizArray(quizzes, lessonPlan, ratingSchema, quizType);
  }
  public evaluateExitQuiz(
    quizzes: QuizQuestionWithRawJson[][],
    lessonPlan: PartialLessonPlan,
    ratingSchema: T,
    quizType: QuizPath,
  ): Promise<z.infer<T>[]> {
    return this.evaluateQuizArray(quizzes, lessonPlan, ratingSchema, quizType);
  }
}
