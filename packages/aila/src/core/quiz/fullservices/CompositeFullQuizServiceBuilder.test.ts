import type { AilaRagRelevantLesson } from "../../../protocol/schema";
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
    const mockRelevantLessons: AilaRagRelevantLesson[] = [
      { lessonPlanId: "clna7k8j400egp4qxrqmjx0qo", title: "test-title-2" },
      { lessonPlanId: "clna7k8kq00fip4qxsjvrmykv", title: "test-title-3" },
      { lessonPlanId: "clna7k8zr00qfp4qx44fdvikl", title: "test-title-5" },
      { lessonPlanId: "clna7k93700sap4qx741wdrz4", title: "test-title-6" },
      { lessonPlanId: "clna7k98j00vup4qx9nyfjtpm", title: "test-title-7" },
      { lessonPlanId: "clna7k8zr00qfp4qx44fdvikl", title: "test-title-8" },
      { lessonPlanId: "clna7k93700sap4qx741wdrz4", title: "test-title-9" },
      { lessonPlanId: "clna7k98j00vup4qx9nyfjtpm", title: "test-title-10" },
      {
        lessonPlanId: "clna7lofy0og0p4qxju5j6z56",
        title: "TEST-LESSON-READING-TIMETABLES",
      },
    ];

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
      mockRelevantLessons,
    );
    expect(quiz).toBeDefined();
    expect(quiz.length).toBeGreaterThan(0);
    expect(quiz[0]?.question).toBeDefined();
    expect(quiz[0]?.answers).toBeDefined();
    expect(quiz[0]?.distractors).toBeDefined();
    console.log(JSON.stringify(quiz, null, 2));
  });
  it("should work with rag and basedonrag", async () => {
    const builder = new CompositeFullQuizServiceBuilder();
    const settings: QuizBuilderSettings = {
      quizRatingSchema: testRatingSchema,
      quizSelector: "simple",
      quizReranker: "return-first",
      quizGenerators: ["rag", "basedOnRag"],
    };
    const mockRelevantLessons: AilaRagRelevantLesson[] = [
      { lessonPlanId: "clna7k8j400egp4qxrqmjx0qo", title: "test-title-2" },
      { lessonPlanId: "clna7k8kq00fip4qxsjvrmykv", title: "test-title-3" },

      { lessonPlanId: "clna7k8zr00qfp4qx44fdvikl", title: "test-title-5" },
      { lessonPlanId: "clna7k93700sap4qx741wdrz4", title: "test-title-6" },
      { lessonPlanId: "clna7k98j00vup4qx9nyfjtpm", title: "test-title-7" },
      { lessonPlanId: "clna7k8zr00qfp4qx44fdvikl", title: "test-title-8" },
      { lessonPlanId: "clna7k93700sap4qx741wdrz4", title: "test-title-9" },
      { lessonPlanId: "clna7k98j00vup4qx9nyfjtpm", title: "test-title-10" },
      {
        lessonPlanId: "clna7lofy0og0p4qxju5j6z56",
        title: "TEST-LESSON-READING-TIMETABLES",
      },
    ];
    const service = builder.build(settings);
    const quiz = await service.createBestQuiz(
      "/starterQuiz",
      CircleTheoremLesson,
      mockRelevantLessons,
    );
    expect(quiz).toBeDefined();
    expect(quiz.length).toBeGreaterThan(0);
    expect(quiz[0]?.question).toBeDefined();
    expect(quiz[0]?.answers).toBeDefined();
    expect(quiz[0]?.distractors).toBeDefined();
    console.log(JSON.stringify(quiz, null, 2));
  });
  it("should work with all generators", async () => {
    const mockRelevantLessons: AilaRagRelevantLesson[] = [
      {
        lessonPlanId: "clna7lofy0og0p4qxju5j6z56",
        title: "TEST-LESSON-READING-TIMETABLES",
      },
    ];
    const builder = new CompositeFullQuizServiceBuilder();
    const settings: QuizBuilderSettings = {
      quizRatingSchema: testRatingSchema,
      quizSelector: "simple",
      quizReranker: "schema-reranker",
      quizGenerators: ["ml", "rag", "basedOnRag"],
    };
    const service = builder.build(settings);
    const quiz = await service.createBestQuiz(
      "/starterQuiz",
      CircleTheoremLesson,
      mockRelevantLessons,
    );
    expect(quiz).toBeDefined();
    expect(quiz.length).toBeGreaterThan(0);
    expect(quiz[0]?.question).toBeDefined();
    expect(quiz[0]?.answers).toBeDefined();
    expect(quiz[0]?.distractors).toBeDefined();
    console.log("Full On Quiz");
    console.log(JSON.stringify(quiz, null, 2));
  });
});
