import { AilaQuizRerankerFactoryImpl } from "./AilaQuizRerankerFactory";
import { TestSchemaReranker } from "./SchemaReranker";
import type { QuizRerankerType } from "./schema";

describe("AilaQuizRerankerFactoryImpl", () => {
  let factory: AilaQuizRerankerFactoryImpl;

  beforeEach(() => {
    factory = new AilaQuizRerankerFactoryImpl();
  });

  it("should create a TestSchemaReranker for a given quiz type", () => {
    const quizType: QuizRerankerType = "schema-reranker";
    const reranker = factory.createAilaQuizReranker(quizType);
    expect(reranker).toBeInstanceOf(TestSchemaReranker);
  });
});
