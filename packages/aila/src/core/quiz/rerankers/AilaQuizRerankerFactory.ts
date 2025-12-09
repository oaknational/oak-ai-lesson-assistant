import type { AilaQuizReranker, AilaQuizRerankerFactory } from "../interfaces";
import type { QuizRerankerType } from "../schema";
import { AiEvaluatorQuizReranker } from "./AiEvaluatorQuizReranker";
import { NoOpReranker } from "./NoOpReranker";
import { ReturnFirstReranker } from "./ReturnFirstReranker";

export class AilaQuizRerankerFactoryImpl implements AilaQuizRerankerFactory {
  public createAilaQuizReranker(quizType: QuizRerankerType): AilaQuizReranker {
    switch (quizType) {
      case "ai-evaluator":
        return new AiEvaluatorQuizReranker();
      case "return-first":
        return new ReturnFirstReranker();
      case "no-op":
        return new NoOpReranker();
    }
  }
}
