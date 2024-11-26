import type { Quiz, QuizPath, QuizQuestion } from "../../protocol/schema";
import { AilaQuizFactory } from "./AilaQuizGeneratorFactory";
import { BasedOnQuizService } from "./BasedOnQuizService";
import { CircleTheoremLesson } from "./fixtures/CircleTheoremsExampleOutput";

describe("BasedOnQuizService", () => {
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
    const expectedGenerator = AilaQuizFactory.createQuizGenerator("basedOnRag");
    expect(quizService.quizGenerators[0]).toBeInstanceOf(
      expectedGenerator.constructor,
    );
  });

  describe("createBestQuiz", () => {
    it("should create a starter quiz", async () => {
      const quiz = await quizService.createBestQuiz(
        "/starterQuiz" as QuizPath,
        CircleTheoremLesson,
      );

      expect(quiz).toBeDefined();
      expect(Array.isArray(quiz)).toBe(true);
      expect(quiz[0]).toHaveProperty("question");
      expect(quiz[0]).toHaveProperty("answers");
      expect(quiz[0]).toHaveProperty("distractors");
    });

    it("should create an exit quiz", async () => {
      const quiz = await quizService.createBestQuiz(
        "/exitQuiz" as QuizPath,
        CircleTheoremLesson,
      );

      expect(quiz).toBeDefined();
      expect(Array.isArray(quiz)).toBe(true);
      //   Once corrected make it length 6.
      //   expect(quiz.length).toBe(1);
      expect(quiz[0]).toHaveProperty("question");
      expect(quiz[0]).toHaveProperty("answers");
      expect(quiz[0]).toHaveProperty("distractors");
    });

    it("should handle invalid quiz paths", async () => {
      await expect(
        quizService.createBestQuiz(
          "/invalidQuiz" as QuizPath,
          CircleTheoremLesson,
        ),
      ).rejects.toThrow();
    });
  });
});
