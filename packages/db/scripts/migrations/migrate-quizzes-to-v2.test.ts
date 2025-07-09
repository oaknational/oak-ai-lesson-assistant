import { upgradeQuizzes } from "@oakai/aila/src/protocol/schemas/quiz/conversion/lessonPlanQuizMigrator";

import { describe, expect, it, jest } from "@jest/globals";

// Mock the logger
jest.mock("@oakai/logger", () => ({
  aiLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

// Type guard to check if result data has expected structure
function hasLessonPlan(
  data: unknown,
): data is { lessonPlan: Record<string, unknown> } & Record<string, unknown> {
  return (
    typeof data === "object" &&
    data !== null &&
    "lessonPlan" in data &&
    typeof data.lessonPlan === "object" &&
    data.lessonPlan !== null
  );
}

describe("Quiz V2 Migration with lessonPlanQuizMigrator", () => {
  describe("upgradeQuizzes function", () => {
    it("should upgrade V1 quizzes to V2", async () => {
      const v1Data = {
        lessonPlan: {
          title: "Test Lesson",
          starterQuiz: [
            {
              question: "What is 2+2?",
              answers: ["4"],
              distractors: ["3", "5", "6"],
            },
          ],
          exitQuiz: [
            {
              question: "What is the capital of France?",
              answers: ["Paris"],
              distractors: ["London", "Berlin", "Madrid"],
            },
          ],
        },
      };

      const result = await upgradeQuizzes({
        data: v1Data,
        persistUpgrade: null,
      });

      expect(result.wasUpgraded).toBe(true);
      expect(result.data).toHaveProperty("lessonPlan");

      if (!hasLessonPlan(result.data)) {
        throw new Error("Expected result.data to have lessonPlan");
      }
      const lessonPlan = result.data.lessonPlan;
      expect(lessonPlan.starterQuiz).toEqual({
        version: "v2",
        questions: [
          {
            questionType: "multiple-choice",
            question: "What is 2+2?",
            answers: ["4"],
            distractors: ["3", "5", "6"],
          },
        ],
      });

      expect(lessonPlan.exitQuiz).toEqual({
        version: "v2",
        questions: [
          {
            questionType: "multiple-choice",
            question: "What is the capital of France?",
            answers: ["Paris"],
            distractors: ["London", "Berlin", "Madrid"],
          },
        ],
      });
    });

    it("should not upgrade V2 quizzes", async () => {
      const v2Data = {
        lessonPlan: {
          title: "Test Lesson",
          starterQuiz: {
            version: "v2",
            questions: [
              {
                questionType: "multiple-choice",
                question: "Already V2",
                answers: ["Yes"],
                distractors: ["No"],
              },
            ],
          },
        },
      };

      const result = await upgradeQuizzes({
        data: v2Data,
        persistUpgrade: null,
      });

      expect(result.wasUpgraded).toBe(false);
      expect(result.data).toEqual(v2Data);
    });

    it("should handle data without lessonPlan", async () => {
      const dataWithoutLessonPlan = {
        someOtherField: "value",
      };

      await expect(
        upgradeQuizzes({
          data: dataWithoutLessonPlan,
          persistUpgrade: null,
        }),
      ).rejects.toThrow("Invalid data structure for quiz upgrade");
    });

    it("should handle mixed V1 and V2 quizzes", async () => {
      const mixedData = {
        lessonPlan: {
          title: "Test Lesson",
          starterQuiz: [
            {
              question: "V1 Quiz",
              answers: ["Answer"],
              distractors: ["Wrong"],
            },
          ],
          exitQuiz: {
            version: "v2",
            questions: [
              {
                questionType: "multiple-choice",
                question: "V2 Quiz",
                answers: ["Answer"],
                distractors: ["Wrong"],
              },
            ],
          },
        },
      };

      const result = await upgradeQuizzes({
        data: mixedData,
        persistUpgrade: null,
      });

      expect(result.wasUpgraded).toBe(true);

      if (!hasLessonPlan(result.data)) {
        throw new Error("Expected result.data to have lessonPlan");
      }
      const lessonPlan = result.data.lessonPlan;
      // Starter quiz should be upgraded
      expect((lessonPlan.starterQuiz as { version: string }).version).toBe("v2");
      // Exit quiz should remain unchanged
      expect(lessonPlan.exitQuiz).toEqual(mixedData.lessonPlan.exitQuiz);
    });

    it("should call persistUpgrade callback when provided", async () => {
      const mockPersist = jest.fn(() => Promise.resolve());
      const v1Data = {
        lessonPlan: {
          starterQuiz: [
            {
              question: "Q1",
              answers: ["A1"],
              distractors: ["D1"],
            },
          ],
        },
      };

      await upgradeQuizzes({
        data: v1Data,
        persistUpgrade: mockPersist as unknown as ((upgradedData: unknown) => Promise<void>) | null,
      });

      expect(mockPersist).toHaveBeenCalledTimes(1);
      expect(mockPersist).toHaveBeenCalledWith(
        expect.objectContaining({
          lessonPlan: expect.objectContaining({
            starterQuiz: expect.objectContaining({
              version: "v2",
            }),
          }),
        }),
      );
    });

    it("should handle empty quizzes", async () => {
      const emptyQuizData = {
        lessonPlan: {
          title: "Test Lesson",
          starterQuiz: [],
          exitQuiz: [],
        },
      };

      const result = await upgradeQuizzes({
        data: emptyQuizData,
        persistUpgrade: null,
      });

      expect(result.wasUpgraded).toBe(true);

      if (!hasLessonPlan(result.data)) {
        throw new Error("Expected result.data to have lessonPlan");
      }
      const lessonPlan = result.data.lessonPlan;
      expect(lessonPlan.starterQuiz).toEqual({
        version: "v2",
        questions: [],
      });
      expect(lessonPlan.exitQuiz).toEqual({
        version: "v2",
        questions: [],
      });
    });

    it("should preserve other lesson plan data", async () => {
      const dataWithOtherFields = {
        lessonPlan: {
          title: "Test Lesson",
          subject: "Math",
          keyStage: "KS2",
          learningOutcome: "Students will learn...",
          starterQuiz: [
            {
              question: "Q1",
              answers: ["A1"],
              distractors: ["D1"],
            },
          ],
        },
        userId: "user123",
        chatId: "chat456",
      };

      const result = await upgradeQuizzes({
        data: dataWithOtherFields,
        persistUpgrade: null,
      });

      expect(result.wasUpgraded).toBe(true);

      if (!hasLessonPlan(result.data)) {
        throw new Error("Expected result.data to have lessonPlan");
      }
      const resultData = result.data;
      expect(resultData.userId).toBe("user123");
      expect(resultData.chatId).toBe("chat456");
      expect(resultData.lessonPlan.title).toBe("Test Lesson");
      expect(resultData.lessonPlan.subject).toBe("Math");
      expect(resultData.lessonPlan.keyStage).toBe("KS2");
      expect(resultData.lessonPlan.learningOutcome).toBe(
        "Students will learn...",
      );
    });
  });
});
