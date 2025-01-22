import type { BaseSchema } from "../ChoiceModels";
import type { AilaQuizReranker, AilaQuizRerankerFactory } from "../interfaces";
import type { QuizRerankerType } from "../schema";
import { testRatingSchema } from "./RerankerStructuredOutputSchema";
import { ReturnFirstReranker } from "./ReturnFirstReranker";
import { TestSchemaReranker } from "./SchemaReranker";

export class AilaQuizRerankerFactoryImpl implements AilaQuizRerankerFactory {
  public createAilaQuizReranker(
    quizType: QuizRerankerType,
  ): AilaQuizReranker<typeof BaseSchema> {
    switch (quizType) {
      case "schema-reranker":
        return new TestSchemaReranker(testRatingSchema, "/starterQuiz");
      case "return-first":
        return new ReturnFirstReranker(testRatingSchema, "/starterQuiz");
    }
  }
}
