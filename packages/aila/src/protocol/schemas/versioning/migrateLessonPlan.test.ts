import { describe, expect, it, jest } from "@jest/globals";

import { PartialLessonPlanSchema } from "../../schema";
import type { QuizV2 } from "../quiz";
import {
  completeLessonPlan,
  invalidInputs,
  lessonPlanWithUndefinedQuizzes,
  lessonPlanWithoutQuizzes,
  mockV1EmptyQuiz,
  mockV1Quiz,
  mockV2Quiz,
} from "./fixtures/migrationTestData";
import type { MigrateLessonPlanArgs } from "./migrateLessonPlan";
import { migrateLessonPlan } from "./migrateLessonPlan";

describe("migrateLessonPlan", () => {
  // Helper function to create migration args
  const createMigrationArgs = (
    lessonPlan: Record<string, unknown>,
    persistMigration: MigrateLessonPlanArgs<
      typeof PartialLessonPlanSchema
    >["persistMigration"] = null,
  ) => ({
    lessonPlan,
    persistMigration,
    outputSchema: PartialLessonPlanSchema,
  });

  describe("input validation", () => {
    it("should accept valid lesson plan objects", async () => {
      const emptyResult = await migrateLessonPlan(createMigrationArgs({}));
      expect(emptyResult.wasMigrated).toBe(false);
      expect(emptyResult.lessonPlan).toEqual({});

      const quizOnlyResult = await migrateLessonPlan(
        createMigrationArgs({
          starterQuiz: mockV2Quiz,
          exitQuiz: mockV2Quiz,
        }),
      );
      expect(quizOnlyResult.wasMigrated).toBe(false);
      expect(quizOnlyResult.lessonPlan.starterQuiz).toEqual(mockV2Quiz);
    });

    it.each(invalidInputs)("should reject invalid input: %p", async (input) => {
      await expect(
        migrateLessonPlan(
          createMigrationArgs(input as Record<string, unknown>),
        ),
      ).rejects.toThrow("Invalid lesson plan format for migration");
    });

    it("should preserve lesson plan fields during migration", async () => {
      const result = await migrateLessonPlan(
        createMigrationArgs(completeLessonPlan),
      );

      expect(result.wasMigrated).toBe(true);
      expect(result.lessonPlan.title).toBe("Complete Lesson");
      expect(result.lessonPlan.subject).toBe("Mathematics");
      expect(result.lessonPlan.keyStage).toBe("key-stage-3");
    });
  });

  describe("migration logic", () => {
    it("should not migrate when quizzes are already V2", async () => {
      const input = {
        starterQuiz: mockV2Quiz,
        exitQuiz: mockV2Quiz,
      };

      const result = await migrateLessonPlan(createMigrationArgs(input));

      expect(result.wasMigrated).toBe(false);
      expect(result.lessonPlan.starterQuiz).toEqual(mockV2Quiz);
    });

    it("should migrate V1 quizzes to V2", async () => {
      const starterOnlyResult = await migrateLessonPlan(
        createMigrationArgs({
          starterQuiz: mockV1Quiz,
          exitQuiz: mockV2Quiz,
        }),
      );
      expect(starterOnlyResult.wasMigrated).toBe(true);
      expect(starterOnlyResult.lessonPlan.starterQuiz).toHaveProperty(
        "version",
        "v2",
      );
      expect(
        (starterOnlyResult.lessonPlan.starterQuiz as QuizV2).questions,
      ).toHaveLength(2);

      const bothResult = await migrateLessonPlan(
        createMigrationArgs({
          starterQuiz: mockV1Quiz,
          exitQuiz: mockV1Quiz,
        }),
      );
      expect(bothResult.wasMigrated).toBe(true);
      expect(bothResult.lessonPlan.starterQuiz).toHaveProperty("version", "v2");
      expect(bothResult.lessonPlan.exitQuiz).toHaveProperty("version", "v2");
    });

    it("should handle missing/undefined quiz values", async () => {
      const missingResult = await migrateLessonPlan(
        createMigrationArgs(lessonPlanWithoutQuizzes),
      );
      expect(missingResult.wasMigrated).toBe(false);

      const undefinedResult = await migrateLessonPlan(
        createMigrationArgs(lessonPlanWithUndefinedQuizzes),
      );
      expect(undefinedResult.wasMigrated).toBe(false);
      expect(undefinedResult.lessonPlan.title).toBe("Test");
    });

    it("should handle empty arrays as V1 quizzes", async () => {
      const result = await migrateLessonPlan(
        createMigrationArgs({
          starterQuiz: mockV1EmptyQuiz,
        }),
      );
      expect(result.wasMigrated).toBe(true);
      expect(result.lessonPlan.starterQuiz).toHaveProperty("version", "v2");
    });
  });

  describe("persistence callback", () => {
    it("should handle persistence callbacks correctly", async () => {
      const mockPersist = jest
        .fn<(lessonPlan: Record<string, unknown>) => Promise<void>>()
        .mockResolvedValue(undefined);

      // Should call when migration occurs
      const migrationResult = await migrateLessonPlan(
        createMigrationArgs({ starterQuiz: mockV1Quiz }, mockPersist),
      );
      expect(migrationResult.wasMigrated).toBe(true);
      expect(mockPersist).toHaveBeenCalledTimes(1);
      expect(mockPersist).toHaveBeenCalledWith(
        expect.objectContaining({
          starterQuiz: expect.objectContaining({ version: "v2" }),
        }),
      );

      mockPersist.mockClear();

      // Should not call when no migration needed
      const noMigrationResult = await migrateLessonPlan(
        createMigrationArgs({ starterQuiz: mockV2Quiz }, mockPersist),
      );
      expect(noMigrationResult.wasMigrated).toBe(false);
      expect(mockPersist).not.toHaveBeenCalled();
    });

    it("should propagate persistence errors", async () => {
      const mockError = new Error("Database connection failed");
      const mockPersist = jest
        .fn<(lessonPlan: Record<string, unknown>) => Promise<void>>()
        .mockRejectedValue(mockError);

      await expect(
        migrateLessonPlan(
          createMigrationArgs({ starterQuiz: mockV1Quiz }, mockPersist),
        ),
      ).rejects.toThrow("Database connection failed");
    });
  });
});
