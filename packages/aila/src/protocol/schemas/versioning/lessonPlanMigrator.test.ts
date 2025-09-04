import { describe, expect, it, jest } from "@jest/globals";

import type { QuizV1, QuizV2 } from "../quiz";
import {
  type MigrateLessonPlanArgs,
  migrateLessonPlan,
} from "./lessonPlanMigrator";

describe("lessonPlanMigrator", () => {
  describe("migrateLessonPlan", () => {
    // Mock quiz data
    const mockV1Quiz: QuizV1 = [
      {
        question: "What is 2 + 2?",
        answers: ["4"],
        distractors: ["3", "5"],
      },
      {
        question: "What is the capital of France?",
        answers: ["Paris"],
        distractors: ["London", "Berlin"],
      },
    ];

    const mockV2Quiz: QuizV2 = {
      version: "v2",
      questions: [
        {
          questionType: "multiple-choice",
          question: "What is the capital of Spain?",
          answers: ["Madrid"],
          distractors: ["Barcelona", "Seville"],
          hint: null,
        },
      ],
      imageAttributions: [],
    };

    // Helper function to create migration args
    const createMigrationArgs = (
      lessonPlan: Record<string, unknown>,
      persistMigration: MigrateLessonPlanArgs["persistMigration"] = null,
    ): MigrateLessonPlanArgs => ({
      lessonPlan,
      persistMigration,
    });

    describe("input validation", () => {
      it("should accept an empty object", async () => {
        const result = await migrateLessonPlan(createMigrationArgs({}));

        expect(result.wasMigrated).toBe(false);
        expect(result.lessonPlan).toEqual({});
      });

      it("should accept an object with only quiz fields", async () => {
        const input = {
          starterQuiz: mockV2Quiz,
          exitQuiz: mockV2Quiz,
        };

        const result = await migrateLessonPlan(createMigrationArgs(input));

        expect(result.wasMigrated).toBe(false);
        expect(result.lessonPlan).toEqual(input);
      });

      it("should accept an object with additional fields", async () => {
        const input = {
          title: "My Lesson",
          subject: "Mathematics",
          starterQuiz: mockV2Quiz,
          exitQuiz: mockV2Quiz,
          customField: "preserved",
        };

        const result = await migrateLessonPlan(createMigrationArgs(input));

        expect(result.wasMigrated).toBe(false);
        expect(result.lessonPlan).toEqual(input);
      });

      it("should reject non-object inputs", async () => {
        const invalidInputs: unknown[] = [
          null,
          undefined,
          "string",
          123,
          true,
          [],
        ];

        for (const input of invalidInputs) {
          await expect(
            migrateLessonPlan(
              createMigrationArgs(input as Record<string, unknown>),
            ),
          ).rejects.toThrow("Invalid lesson plan format for migration:");
        }
      });

      it("should preserve unknown fields during migration", async () => {
        const input = {
          title: "Test Lesson",
          customArray: [1, 2, 3],
          nestedObject: { key: "value" },
          starterQuiz: mockV1Quiz,
          exitQuiz: mockV2Quiz,
        };

        const result = await migrateLessonPlan(createMigrationArgs(input));

        expect(result.wasMigrated).toBe(true);
        expect(result.lessonPlan.title).toBe("Test Lesson");
        expect(result.lessonPlan.customArray).toEqual([1, 2, 3]);
        expect(result.lessonPlan.nestedObject).toEqual({ key: "value" });
      });
    });

    describe("migration logic", () => {
      it("should not migrate when both quizzes are already V2", async () => {
        const input = {
          starterQuiz: mockV2Quiz,
          exitQuiz: mockV2Quiz,
        };

        const result = await migrateLessonPlan(createMigrationArgs(input));

        expect(result.wasMigrated).toBe(false);
        expect(result.lessonPlan.starterQuiz).toEqual(mockV2Quiz);
        expect(result.lessonPlan.exitQuiz).toEqual(mockV2Quiz);
      });

      it("should migrate only starterQuiz from V1 to V2", async () => {
        const input = {
          starterQuiz: mockV1Quiz,
          exitQuiz: mockV2Quiz,
        };

        const result = await migrateLessonPlan(createMigrationArgs(input));

        expect(result.wasMigrated).toBe(true);
        expect(result.lessonPlan.starterQuiz).toHaveProperty("version", "v2");
        expect(result.lessonPlan.starterQuiz).toHaveProperty("questions");
        expect(
          (result.lessonPlan.starterQuiz as QuizV2).questions,
        ).toHaveLength(2);
        expect(result.lessonPlan.exitQuiz).toEqual(mockV2Quiz);
      });

      it("should migrate only exitQuiz from V1 to V2", async () => {
        const input = {
          starterQuiz: mockV2Quiz,
          exitQuiz: mockV1Quiz,
        };

        const result = await migrateLessonPlan(createMigrationArgs(input));

        expect(result.wasMigrated).toBe(true);
        expect(result.lessonPlan.starterQuiz).toEqual(mockV2Quiz);
        expect(result.lessonPlan.exitQuiz).toHaveProperty("version", "v2");
        expect(result.lessonPlan.exitQuiz).toHaveProperty("questions");
        expect((result.lessonPlan.exitQuiz as QuizV2).questions).toHaveLength(
          2,
        );
      });

      it("should migrate both quizzes from V1 to V2", async () => {
        const input = {
          starterQuiz: mockV1Quiz,
          exitQuiz: mockV1Quiz,
        };

        const result = await migrateLessonPlan(createMigrationArgs(input));

        expect(result.wasMigrated).toBe(true);
        expect(result.lessonPlan.starterQuiz).toHaveProperty("version", "v2");
        expect(result.lessonPlan.starterQuiz).toHaveProperty("questions");
        expect(result.lessonPlan.exitQuiz).toHaveProperty("version", "v2");
        expect(result.lessonPlan.exitQuiz).toHaveProperty("questions");
      });

      it("should handle missing quizzes gracefully", async () => {
        const input = {
          title: "Lesson without quizzes",
          subject: "Science",
        };

        const result = await migrateLessonPlan(createMigrationArgs(input));

        expect(result.wasMigrated).toBe(false);
        expect(result.lessonPlan).toEqual(input);
      });

      it("should handle undefined quiz values", async () => {
        const input = {
          starterQuiz: undefined,
          exitQuiz: undefined,
          title: "Test",
        };

        const result = await migrateLessonPlan(createMigrationArgs(input));

        expect(result.wasMigrated).toBe(false);
        expect(result.lessonPlan.title).toBe("Test");
      });
    });

    describe("version detection", () => {
      it("should detect V1 format (array)", async () => {
        const input = {
          starterQuiz: mockV1Quiz,
        };

        const result = await migrateLessonPlan(createMigrationArgs(input));

        expect(result.wasMigrated).toBe(true);
        expect(result.lessonPlan.starterQuiz).toHaveProperty("version", "v2");
      });

      it("should detect V2 format (object with version)", async () => {
        const input = {
          starterQuiz: mockV2Quiz,
        };

        const result = await migrateLessonPlan(createMigrationArgs(input));

        expect(result.wasMigrated).toBe(false);
        expect(result.lessonPlan.starterQuiz).toEqual(mockV2Quiz);
      });
    });

    describe("persistence callback", () => {
      it("should call persistMigration when migration occurs", async () => {
        const input = {
          starterQuiz: mockV1Quiz,
          exitQuiz: mockV2Quiz,
        };

        const mockPersist = jest
          .fn<(lessonPlan: Record<string, unknown>) => Promise<void>>()
          .mockResolvedValue(undefined);

        const result = await migrateLessonPlan(
          createMigrationArgs(input, mockPersist),
        );

        expect(result.wasMigrated).toBe(true);
        expect(mockPersist).toHaveBeenCalledTimes(1);
        expect(mockPersist).toHaveBeenCalledWith(
          expect.objectContaining({
            starterQuiz: expect.objectContaining({
              version: "v2",
              questions: expect.any(Array),
            }),
            exitQuiz: mockV2Quiz,
          }),
        );
      });

      it("should not call persistMigration when no migration needed", async () => {
        const input = {
          starterQuiz: mockV2Quiz,
          exitQuiz: mockV2Quiz,
        };

        const mockPersist = jest
          .fn<(lessonPlan: Record<string, unknown>) => Promise<void>>()
          .mockResolvedValue(undefined);

        const result = await migrateLessonPlan(
          createMigrationArgs(input, mockPersist),
        );

        expect(result.wasMigrated).toBe(false);
        expect(mockPersist).not.toHaveBeenCalled();
      });

      it("should propagate errors from failed persistence", async () => {
        const input = {
          starterQuiz: mockV1Quiz,
        };

        const mockError = new Error("Database connection failed");
        const mockPersist = jest
          .fn<(lessonPlan: Record<string, unknown>) => Promise<void>>()
          .mockRejectedValue(mockError);

        await expect(
          migrateLessonPlan(createMigrationArgs(input, mockPersist)),
        ).rejects.toThrow("Database connection failed");

        expect(mockPersist).toHaveBeenCalledTimes(1);
      });
    });

    describe("edge cases", () => {
      it("should handle empty arrays as quizzes", async () => {
        const input = {
          starterQuiz: [],
          exitQuiz: [],
        };

        const result = await migrateLessonPlan(createMigrationArgs(input));

        expect(result.wasMigrated).toBe(true);
        expect(result.lessonPlan.starterQuiz).toHaveProperty("version", "v2");
        expect(result.lessonPlan.exitQuiz).toHaveProperty("version", "v2");
      });

      it("should handle very large lesson plans", async () => {
        const largeInput = {
          title: "Large Lesson",
          starterQuiz: mockV1Quiz,
          exitQuiz: mockV2Quiz,
          // Add many additional fields
          ...Array.from({ length: 100 }, (_, i) => ({
            [`field${i}`]: `value${i}`,
          })).reduce((acc, obj) => ({ ...acc, ...obj }), {}),
        };

        const result = await migrateLessonPlan(createMigrationArgs(largeInput));

        expect(result.wasMigrated).toBe(true);
        expect(result.lessonPlan.title).toBe("Large Lesson");
        expect(result.lessonPlan.field0).toBe("value0");
        expect(result.lessonPlan.field99).toBe("value99");
      });
    });
  });
});
