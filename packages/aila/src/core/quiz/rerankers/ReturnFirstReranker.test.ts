import { aiLogger } from "@oakai/logger";

import type { z } from "zod";

import type { QuizV1Question } from "../../../protocol/schema";
import { cachedQuiz } from "../fixtures/CachedImageQuiz";
import { testRatingSchema } from "./RerankerStructuredOutputSchema";
import { ReturnFirstReranker } from "./ReturnFirstReranker";

const log = aiLogger("aila:quiz");

describe("ReturnFirstReranker", () => {
  let reranker: ReturnFirstReranker;

  beforeEach(() => {
    reranker = new ReturnFirstReranker();
  });

  describe("rerankQuiz", () => {
    it("should return [0] even with empty quiz array", async () => {
      const result = await reranker.rerankQuiz([]);
      expect(result).toEqual([0]);
    });
  });

  describe("evaluateQuizArray", () => {
    it("should return array of ratings with first item rated 1 and others 0", async () => {
      const mockQuizzes: QuizV1Question[][] = [cachedQuiz, cachedQuiz];

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
      log.info(JSON.stringify(result, null, 2));
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
      const mockQuizzes: QuizV1Question[][] = [cachedQuiz, cachedQuiz];

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
