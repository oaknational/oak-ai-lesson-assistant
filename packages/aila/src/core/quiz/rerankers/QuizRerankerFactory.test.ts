import type { QuizRerankerType } from "../schema";
import { AiEvaluatorQuizReranker } from "./AiEvaluatorQuizReranker";
import { AilaQuizRerankerFactoryImpl } from "./AilaQuizRerankerFactory";
import { ReturnFirstReranker } from "./ReturnFirstReranker";

describe("AilaQuizRerankerFactoryImpl", () => {
  let factory: AilaQuizRerankerFactoryImpl;

  beforeEach(() => {
    factory = new AilaQuizRerankerFactoryImpl();
  });

  it("should create a AiEvaluatorQuizReranker for ai-evaluator type", () => {
    const quizType: QuizRerankerType = "ai-evaluator";
    const reranker = factory.createAilaQuizReranker(quizType);
    expect(reranker).toBeInstanceOf(AiEvaluatorQuizReranker);
  });

  it("should create a ReturnFirstReranker for return-first type", () => {
    const quizType: QuizRerankerType = "return-first";
    const reranker = factory.createAilaQuizReranker(quizType);
    expect(reranker).toBeInstanceOf(ReturnFirstReranker);
  });
});
