import { CircleTheoremLesson } from "../fixtures/CircleTheoremsExampleOutput";
import { testRatingSchema } from "../rerankers/RerankerStructuredOutputSchema";
import type { QuizBuilderSettings } from "../schema";
import { CompositeFullQuizServiceBuilder } from "./CompositeFullQuizServiceBuilder";

describe("CompositeFullQuizServiceBuilder", () => {
  jest.setTimeout(60000);
  it("should build a CompositeFullQuizService", () => {
    const builder = new CompositeFullQuizServiceBuilder();
    const settings: QuizBuilderSettings = {
      quizRatingSchema: testRatingSchema,
      quizSelector: "simple",
      quizReranker: "schema-reranker",
      quizGenerators: ["ml"],
    };
    const service = builder.build(settings);
    expect(service).toBeDefined();
    expect(service.quizSelector).toBeDefined();
    expect(service.quizReranker).toBeDefined();
    expect(service.quizGenerators).toBeDefined();
    expect(service.quizGenerators.length).toBe(1);
    expect(service.quizGenerators[0]).toBeDefined();
  });

  it("Should work with a simple quiz selector", async () => {
    const builder = new CompositeFullQuizServiceBuilder();
    const settings: QuizBuilderSettings = {
      quizRatingSchema: testRatingSchema,
      quizSelector: "simple",
      quizReranker: "schema-reranker",
      quizGenerators: ["ml"],
    };
    const service = builder.build(settings);
    const quiz = await service.createBestQuiz(
      "/starterQuiz",
      CircleTheoremLesson,
    );
    expect(quiz).toBeDefined();
    expect(quiz.length).toBeGreaterThan(0);
    expect(quiz[0]?.question).toBeDefined();
    expect(quiz[0]?.answers).toBeDefined();
    expect(quiz[0]?.distractors).toBeDefined();
    console.log(JSON.stringify(quiz, null, 2));
  });

  it("Should work with a rag quiz generator", async () => {
    const builder = new CompositeFullQuizServiceBuilder();
    const settings: QuizBuilderSettings = {
      quizRatingSchema: testRatingSchema,
      quizSelector: "simple",
      quizReranker: "schema-reranker",
      quizGenerators: ["rag"],
    };
    const service = builder.build(settings);
    const quiz = await service.createBestQuiz(
      "/starterQuiz",
      CircleTheoremLesson,
    );
  });
});
