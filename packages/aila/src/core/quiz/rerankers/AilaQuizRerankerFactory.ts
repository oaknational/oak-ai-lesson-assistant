import type { z } from "zod";

import type { BaseType } from "../ChoiceModels";
import type { AilaQuizReranker, AilaQuizRerankerFactory } from "../interfaces";
import type { QuizRerankerType } from "../schema";
import { testRatingSchema } from "./RerankerStructuredOutputSchema";
import { ReturnFirstReranker } from "./ReturnFirstReranker";
import { TestSchemaReranker } from "./SchemaReranker";

export class AilaQuizRerankerFactoryImpl implements AilaQuizRerankerFactory {
  public createAilaQuizReranker(
    quizType: QuizRerankerType,
  ): AilaQuizReranker<z.ZodType<BaseType>> {
    switch (quizType) {
      case "schema-reranker":
        return new TestSchemaReranker(testRatingSchema, "/starterQuiz");
      case "return-first":
        return new ReturnFirstReranker(testRatingSchema, "/starterQuiz");
    }
  }
}
