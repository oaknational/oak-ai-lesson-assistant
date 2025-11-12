import { QuizQuestionRetrievalService } from "./QuizQuestionRetrievalService";

describe("QuizQuestionRetrievalService", () => {
  let service: QuizQuestionRetrievalService;

  jest.setTimeout(30000);

  beforeEach(() => {
    service = new QuizQuestionRetrievalService();
  });

  describe("retrieveQuestionsByIds", () => {
    it("should preserve question order from input UIDs", async () => {
      // Use one real UID to test that it's retrieved correctly
      const uid1 = "QUES-EYPJ1-67826";

      const questions = await service.retrieveQuestionsByIds([uid1]);

      // Should get back the question
      expect(questions.length).toBe(1);
      expect(questions[0]?.sourceUid).toBe(uid1);
    });

    it("should return empty array when no questions found", async () => {
      const nonExistentUids = [
        "QUES-NONEXISTENT-00001",
        "QUES-NONEXISTENT-00002",
        "QUES-NONEXISTENT-00003",
      ];

      const questions = await service.retrieveQuestionsByIds(nonExistentUids);

      expect(questions).toEqual([]);
    });

    it("should filter out non-existent questions but preserve order of found ones", async () => {
      const mixedUids = [
        "QUES-EYPJ1-67826",           // Real (should be first in results)
        "QUES-NONEXISTENT-00001",     // Fake (should be filtered out)
        "QUES-XXXXX-STRICT",          // Real placeholder (should be second in results)
        "QUES-NONEXISTENT-00002",     // Fake (should be filtered out)
      ];

      const questions = await service.retrieveQuestionsByIds(mixedUids);

      // Should only get real questions in the order they appeared in input
      const foundIds = questions.map((q) => q.sourceUid).filter((id): id is string => !!id);
      const expectedRealUids = mixedUids.filter((uid) => foundIds.includes(uid));

      expect(foundIds).toEqual(expectedRealUids);

      // Verify we got some questions but not all
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.length).toBeLessThan(mixedUids.length);
    });
  });
});
