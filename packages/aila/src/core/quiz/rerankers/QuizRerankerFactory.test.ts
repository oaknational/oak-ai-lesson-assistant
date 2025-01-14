import type { QuizRerankerType } from "../schema";
import { AilaQuizRerankerFactoryImpl } from "./AilaQuizRerankerFactory";
import { ReturnFirstReranker } from "./ReturnFirstReranker";

describe("AilaQuizRerankerFactoryImpl", () => {
  let factory: AilaQuizRerankerFactoryImpl;

  beforeEach(() => {
    factory = new AilaQuizRerankerFactoryImpl();
  });

  it("should create a TestSchemaReranker for a given quiz type", () => {
    const quizType: QuizRerankerType = "return-first";
    const reranker = factory.createAilaQuizReranker(quizType);
    expect(reranker).toBeInstanceOf(ReturnFirstReranker);
  });
});
