import type { z } from "zod";

import type { BaseType } from "../ChoiceModels";
import type { AilaQuizReranker, AilaQuizRerankerFactory } from "../interfaces";
import type { QuizRerankerType } from "../schema";
import { testRatingSchema } from "./RerankerStructuredOutputSchema";
import { ReturnFirstReranker } from "./ReturnFirstReranker";

export class AilaQuizRerankerFactoryImpl implements AilaQuizRerankerFactory {
  public createAilaQuizReranker(
    quizType: QuizRerankerType,
  ): AilaQuizReranker<z.ZodType<BaseType>> {
    switch (quizType) {
      case "schema-reranker":
        throw new Error(
          "Schema reranker not implemented import from other branch",
        );
      case "return-first":
        return new ReturnFirstReranker(testRatingSchema, "/starterQuiz");
    }
  }
}
