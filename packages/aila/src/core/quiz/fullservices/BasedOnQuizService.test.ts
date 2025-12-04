import { aiLogger } from "@oakai/logger";

import { CircleTheoremLesson } from "../fixtures/CircleTheoremsExampleOutput";
import { BasedOnRagQuizGenerator } from "../generators/BasedOnRagQuizGenerator";
import { createMockTask } from "../instrumentation";
import { BasedOnQuizService } from "./BasedOnQuizService";

const log = aiLogger("quiz");

const shouldSkipTests = process.env.TEST_QUIZZES === "false";

(shouldSkipTests ? describe.skip : describe)("BasedOnQuizService", () => {
  let quizService: BasedOnQuizService;

  beforeEach(() => {
    quizService = new BasedOnQuizService();
  });

  it("should initialize with correct dependencies", () => {
    expect(quizService.quizGenerators).toBeDefined();
    expect(quizService.quizGenerators.length).toBe(1);
    expect(quizService.quizReranker).toBeDefined();
    expect(quizService.quizSelector).toBeDefined();
  });

  it("should have a basedOnRag quiz generator", () => {
    expect(quizService.quizGenerators[0]).toBeInstanceOf(
      BasedOnRagQuizGenerator,
    );
  });

  describe("buildQuiz", () => {
    it("should create a starter quiz", async () => {
      const task = createMockTask();
      const quiz = await quizService.buildQuiz(
        "/starterQuiz",
        CircleTheoremLesson,
        [],
        task,
      );
      log.info("QUIZ BELOW");
      log.info(JSON.stringify(quiz));
      expect(quiz).toBeDefined();
      expect(quiz.version).toBe("v3");
      expect(Array.isArray(quiz.questions)).toBe(true);
      expect(quiz.questions.length).toBeGreaterThan(0);
      expect(quiz.questions[0]).toHaveProperty("question");
      expect(quiz.questions[0]).toHaveProperty("questionType");
    });

    it("should create an exit quiz", async () => {
      const task = createMockTask();
      const quiz = await quizService.buildQuiz(
        "/exitQuiz",
        CircleTheoremLesson,
        [],
        task,
      );

      expect(quiz).toBeDefined();
      expect(quiz.version).toBe("v3");
      expect(Array.isArray(quiz.questions)).toBe(true);
      expect(quiz.questions.length).toBeGreaterThan(0);
      expect(quiz.questions[0]).toHaveProperty("question");
      expect(quiz.questions[0]).toHaveProperty("questionType");
    });
  });
});
