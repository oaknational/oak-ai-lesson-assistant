import { aiLogger } from "@oakai/logger";

import {
  cachedQuiz,
  createMockQuestionPool,
} from "../fixtures/CachedImageQuiz";
import { ReturnFirstReranker } from "./ReturnFirstReranker";

const log = aiLogger("aila:quiz");

describe("ReturnFirstReranker", () => {
  let reranker: ReturnFirstReranker;

  beforeEach(() => {
    reranker = new ReturnFirstReranker();
  });

  describe("evaluateQuizArray", () => {
    it("should return array of ratings with first item rated 1 and others 0", async () => {
      const mockQuestionPools = [
        createMockQuestionPool(cachedQuiz),
        createMockQuestionPool(cachedQuiz),
      ];

      const mockLessonPlan = {
        title: "Test Lesson",
        content: "Test content",
      };

      const result = await reranker.evaluateQuizArray(
        mockQuestionPools,
        mockLessonPlan,
        "/exitQuiz",
      );

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
        "/exitQuiz",
      );

      expect(result).toHaveLength(0);
    });

    it("should populate schema fields correctly", async () => {
      const mockQuestionPools = [
        createMockQuestionPool(cachedQuiz),
        createMockQuestionPool(cachedQuiz),
      ];

      const mockLessonPlan = {
        title: "Test Lesson",
        content: "Test content",
      };

      const result = await reranker.evaluateQuizArray(
        mockQuestionPools,
        mockLessonPlan,
        "/exitQuiz",
      );
    });
  });
});
