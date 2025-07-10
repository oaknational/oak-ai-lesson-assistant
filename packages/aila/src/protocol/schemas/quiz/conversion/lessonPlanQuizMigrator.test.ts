import { describe, expect, it, jest } from "@jest/globals";

import type { QuizV1, QuizV2 } from "..";
import { upgradeQuizzes } from "./lessonPlanQuizMigrator";

type TestLessonPlanData = {
  lessonPlan: {
    starterQuiz?: QuizV1 | QuizV2;
    exitQuiz?: QuizV1 | QuizV2;
  } & Record<string, unknown>;
} & Record<string, unknown>;

describe("quiz upgrader", () => {
  describe("upgradeQuizzes", () => {
    const mockV1Quiz: QuizV1 = [
      {
        question: "What is 2 + 2?",
        answers: ["3", "4", "5"],
        distractors: ["3", "5"],
      },
    ];

    const mockV2Quiz: QuizV2 = {
      version: "v2",
      questions: [
        {
          questionType: "multiple-choice",
          question: "What is the capital of France?",
          answers: ["Paris"],
          distractors: ["London", "Berlin"],
          imageAttributions: [],
        },
      ],
    };

    it("should throw an error if data doesn't have a lessonPlan property", async () => {
      const invalidData = {
        starterQuiz: mockV1Quiz,
        exitQuiz: mockV1Quiz,
      };

      await expect(
        upgradeQuizzes({
          data: invalidData,
          persistUpgrade: null,
        }),
      ).rejects.toThrow(
        "Invalid data structure for quiz upgrade: Expected an object with a 'lessonPlan' property.",
      );
    });

    it("should return original data if no upgrades are needed", async () => {
      const validData = {
        lessonPlan: {
          starterQuiz: mockV2Quiz,
          exitQuiz: mockV2Quiz,
        },
      };

      const result = await upgradeQuizzes({
        data: validData,
        persistUpgrade: null,
      });

      expect(result.wasUpgraded).toBe(false);
      expect(result.data).toEqual(validData);
    });

    it("should upgrade V1 starter quiz to V2", async () => {
      const validData = {
        lessonPlan: {
          starterQuiz: mockV1Quiz,
          exitQuiz: mockV2Quiz,
        },
      };

      const result = await upgradeQuizzes({
        data: validData,
        persistUpgrade: null,
      });

      expect(result.wasUpgraded).toBe(true);
      const upgradedData = result.data as unknown as TestLessonPlanData;
      expect(upgradedData.lessonPlan.starterQuiz).toHaveProperty(
        "version",
        "v2",
      );
      expect(upgradedData.lessonPlan.starterQuiz).toHaveProperty("questions");
      expect(upgradedData.lessonPlan.exitQuiz).toEqual(mockV2Quiz);
    });

    it("should upgrade V1 exit quiz to V2", async () => {
      const validData = {
        lessonPlan: {
          starterQuiz: mockV2Quiz,
          exitQuiz: mockV1Quiz,
        },
      };

      const result = await upgradeQuizzes({
        data: validData,
        persistUpgrade: null,
      });

      expect(result.wasUpgraded).toBe(true);
      const upgradedData = result.data as unknown as TestLessonPlanData;
      expect(upgradedData.lessonPlan.starterQuiz).toEqual(mockV2Quiz);
      expect(upgradedData.lessonPlan.exitQuiz).toHaveProperty("version", "v2");
      expect(upgradedData.lessonPlan.exitQuiz).toHaveProperty("questions");
    });

    it("should upgrade both V1 quizzes to V2", async () => {
      const validData = {
        lessonPlan: {
          starterQuiz: mockV1Quiz,
          exitQuiz: mockV1Quiz,
        },
      };

      const result = await upgradeQuizzes({
        data: validData,
        persistUpgrade: null,
      });

      expect(result.wasUpgraded).toBe(true);
      const upgradedData = result.data as unknown as TestLessonPlanData;
      expect(upgradedData.lessonPlan.starterQuiz).toHaveProperty(
        "version",
        "v2",
      );
      expect(upgradedData.lessonPlan.starterQuiz).toHaveProperty("questions");
      expect(upgradedData.lessonPlan.exitQuiz).toHaveProperty("version", "v2");
      expect(upgradedData.lessonPlan.exitQuiz).toHaveProperty("questions");
    });

    it("should call persistUpgrade callback when provided", async () => {
      const validData = {
        lessonPlan: {
          starterQuiz: mockV1Quiz,
          exitQuiz: mockV2Quiz,
        },
      };

      const mockPersistUpgrade = jest
        .fn<(data: unknown) => Promise<void>>()
        .mockResolvedValue(undefined);

      const result = await upgradeQuizzes({
        data: validData,
        persistUpgrade: mockPersistUpgrade,
      });

      expect(result.wasUpgraded).toBe(true);
      expect(mockPersistUpgrade).toHaveBeenCalledTimes(1);
      expect(mockPersistUpgrade).toHaveBeenCalledWith(
        expect.objectContaining({
          lessonPlan: expect.objectContaining({
            starterQuiz: expect.objectContaining({
              version: "v2",
              questions: expect.any(Array),
            }),
            exitQuiz: mockV2Quiz,
          }),
        }),
      );
    });

    it("should propagate error if persistUpgrade fails", async () => {
      const validData = {
        lessonPlan: {
          starterQuiz: mockV1Quiz,
          exitQuiz: mockV2Quiz,
        },
      };

      const mockError = new Error("Persistence failed");
      const mockPersistUpgrade = jest
        .fn<(data: unknown) => Promise<void>>()
        .mockRejectedValue(mockError);

      await expect(
        upgradeQuizzes({
          data: validData,
          persistUpgrade: mockPersistUpgrade,
        }),
      ).rejects.toThrow("Persistence failed");

      expect(mockPersistUpgrade).toHaveBeenCalledTimes(1);
    });

    it("should handle missing quizzes gracefully", async () => {
      const validData = {
        lessonPlan: {
          title: "My Lesson",
        },
      };

      const result = await upgradeQuizzes({
        data: validData,
        persistUpgrade: null,
      });

      expect(result.wasUpgraded).toBe(false);
      expect(result.data).toEqual(validData);
    });

    it("should preserve other lessonPlan properties", async () => {
      const validData = {
        lessonPlan: {
          title: "My Lesson",
          objectives: ["Objective 1", "Objective 2"],
          starterQuiz: mockV1Quiz,
          exitQuiz: mockV2Quiz,
        },
        otherProperty: "preserved",
      };

      const result = await upgradeQuizzes({
        data: validData,
        persistUpgrade: null,
      });

      expect(result.wasUpgraded).toBe(true);
      const upgradedData = result.data as unknown as TestLessonPlanData;
      expect(upgradedData.lessonPlan.title).toBe("My Lesson");
      expect(upgradedData.lessonPlan.objectives).toEqual([
        "Objective 1",
        "Objective 2",
      ]);
      expect(upgradedData.otherProperty).toBe("preserved");
    });
  });
});
