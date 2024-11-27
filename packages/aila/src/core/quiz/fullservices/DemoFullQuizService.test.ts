import type { LooseLessonPlan } from "../../protocol/schema";
import { DemoFullQuizService } from "./DemoFullQuizService";
import { cachedQuiz } from "./fixtures/fixtures_for_matt";

describe("DemoFullQuizService", () => {
  let service: DemoFullQuizService;
  let mockLessonPlan: LooseLessonPlan;

  beforeEach(() => {
    service = new DemoFullQuizService();
    mockLessonPlan = {
      title: "Test Lesson",
      subject: "Maths",
      keyStage: "KS3",
      topic: "Geometry",
      learningOutcome: "Understanding angles",
    };
  });

  describe("createBestQuiz", () => {
    it("should return cached quiz for starter quiz", async () => {
      const quiz = await service.createBestQuiz("/starterQuiz", mockLessonPlan);
      expect(quiz).toEqual(cachedQuiz);
    });

    it("should return cached quiz for exit quiz", async () => {
      const quiz = await service.createBestQuiz("/exitQuiz", mockLessonPlan);
      expect(quiz).toEqual(cachedQuiz);
    });
  });

  it("should have required service properties", () => {
    expect(service.quizSelector).toBeDefined();
    expect(service.quizReranker).toBeDefined();
    expect(service.quizGenerators).toBeDefined();
    expect(Array.isArray(service.quizGenerators)).toBe(true);
  });
});
