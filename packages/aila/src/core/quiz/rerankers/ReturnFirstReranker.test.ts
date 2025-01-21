import type { z } from "zod";

import type { QuizQuestion } from "../../../protocol/schema";
import { cachedQuiz } from "../fixtures/CachedImageQuiz";
import { testRatingSchema } from "./RerankerStructuredOutputSchema";
import { ReturnFirstReranker } from "./ReturnFirstReranker";

describe("ReturnFirstReranker", () => {
  let reranker: ReturnFirstReranker;

  beforeEach(() => {
    reranker = new ReturnFirstReranker();
  });

  describe("rerankQuiz", () => {
    // The below is not required.
    // it("should always return [0]", async () => {
    //   const mockQuizzes: QuizQuestion[][] = [cachedQuiz, cachedQuiz];

    //   const result = await reranker.rerankQuiz(mockQuizzes);
    //   expect(result).toEqual([0, 0]);
    // });

    it("should return [0] even with empty quiz array", async () => {
      const result = await reranker.rerankQuiz([]);
      expect(result).toEqual([0]);
    });
  });

  describe("evaluateQuizArray", () => {
    it("should return array of ratings with first item rated 1 and others 0", async () => {
      const mockQuizzes: QuizQuestion[][] = [cachedQuiz, cachedQuiz];

      const mockLessonPlan = {
        title: "Test Lesson",
        content: "Test content",
      };

      const result = (await reranker.evaluateQuizArray(
        mockQuizzes,
        mockLessonPlan,
        testRatingSchema,
        "/exitQuiz",
      )) as unknown as z.infer<typeof testRatingSchema>[];

      expect(result[0]?.rating).toBe(1);
      expect(result[1]?.rating).toBe(0);
      console.log(JSON.stringify(result, null, 2));
    });

    it("should handle empty quiz array", async () => {
      const mockLessonPlan = {
        title: "Test Lesson",
        content: "Test content",
      };

      const result = await reranker.evaluateQuizArray(
        [],
        mockLessonPlan,
        testRatingSchema,
        "/exitQuiz",
      );

      expect(result).toHaveLength(0);
    });

    it("should populate schema fields correctly", async () => {
      const mockQuizzes: QuizQuestion[][] = [cachedQuiz, cachedQuiz];

      const mockLessonPlan = {
        title: "Test Lesson",
        content: "Test content",
      };

      const result = await reranker.evaluateQuizArray(
        mockQuizzes,
        mockLessonPlan,
        testRatingSchema,
        "/exitQuiz",
      );
    });
  });
});
