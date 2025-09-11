import { aiLogger } from "@oakai/logger";

import { z } from "zod";

import type { LooseLessonPlan } from "../../schema";
import {
  LessonPlanSchema,
  LessonPlanSchemaWhilstStreaming,
} from "../../schema";
import type { LatestQuiz } from "../quiz";
import { QuizV1Schema, QuizV2Schema } from "../quiz";
import { convertQuizV1ToV2, isQuizV1 } from "../quiz/conversion/quizV1ToV2";

const log = aiLogger("aila:schema");

export type MigrationResult = {
  lessonPlan: LooseLessonPlan;
  wasMigrated: boolean;
};

// Schema for quiz data that can be migrated - accepts both V1 and V2 formats
export const MigratableQuizSchema = z.union([
  QuizV1Schema, // Array of V1 questions
  QuizV2Schema, // Object with version "v2" and questions array
]);

// Proper input schema for lesson plan migration
export const LessonPlanMigrationInputSchema = LessonPlanSchema.extend({
  starterQuiz: MigratableQuizSchema.optional(),
  exitQuiz: MigratableQuizSchema.optional(),
});

export type LessonPlanMigrationInput = z.infer<
  typeof LessonPlanMigrationInputSchema
>;

const versionedSections = {
  starterQuiz: {
    key: "starterQuiz" as const,
    latestVersion: 2,
    migrate: (section: unknown): LatestQuiz => {
      const quiz = MigratableQuizSchema.parse(section);
      // Migrate to latest version (currently V2)
      return isQuizV1(quiz) ? convertQuizV1ToV2(quiz) : quiz;
    },
  },
  exitQuiz: {
    key: "exitQuiz" as const,
    latestVersion: 2,
    migrate: (section: unknown): LatestQuiz => {
      const quiz = MigratableQuizSchema.parse(section);
      // Migrate to latest version (currently V2)
      return isQuizV1(quiz) ? convertQuizV1ToV2(quiz) : quiz;
    },
  },
} as const;

const getCurrentVersion = (section: unknown, sectionKey: string): number => {
  if (
    typeof section !== "object" ||
    section === null ||
    !("version" in section)
  ) {
    return 1;
  }

  if (typeof section.version === "string") {
    // Remove 'v' prefix and parse (e.g., "v2" => "2", "123" => "123")
    return parseInt(section.version.replace("v", ""), 10);
  }

  if (typeof section.version === "number") {
    return section.version;
  }

  throw new Error(`Invalid version for section ${sectionKey}`);
};

export type MigrateLessonPlanArgs = {
  lessonPlan: LessonPlanMigrationInput | Record<string, unknown>;
  persistMigration: ((lessonPlan: LooseLessonPlan) => Promise<void>) | null;
};

export const migrateLessonPlan = async ({
  lessonPlan: originalLessonPlan,
  persistMigration,
}: MigrateLessonPlanArgs): Promise<MigrationResult> => {
  if (
    originalLessonPlan &&
    typeof originalLessonPlan === "object" &&
    "lessonPlan" in originalLessonPlan
  ) {
    throw new Error("Invalid lesson plan format. Not expecting lessonPlan key");
  }

  // Validate input is a valid lesson plan structure
  const parseResult =
    LessonPlanMigrationInputSchema.safeParse(originalLessonPlan);
  if (!parseResult.success) {
    throw new Error("Invalid lesson plan format for migration", {
      cause: parseResult.error,
    });
  }

  let wasMigrated = false;
  const lessonPlan = { ...parseResult.data };

  for (const section of Object.values(versionedSections)) {
    const { key, latestVersion, migrate } = section;

    // Check if this section exists in the lesson plan
    const sectionData = lessonPlan[key];
    if (!sectionData) {
      log.info(`Section ${key} not found in lesson plan`);
      continue;
    }

    const currentVersion = getCurrentVersion(sectionData, key);

    if (currentVersion < latestVersion) {
      lessonPlan[key] = migrate(sectionData);
      log.info("Migrated section:", key);
      wasMigrated = true;
    }
  }

  // Parse the migrated lesson plan with the proper schema
  const finalParseResult =
    LessonPlanSchemaWhilstStreaming.safeParse(lessonPlan);
  if (!finalParseResult.success) {
    throw new Error("Migrated lesson plan failed validation", {
      cause: finalParseResult.error,
    });
  }

  const typedLessonPlan = finalParseResult.data;

  // Call the persistence callback if provided
  if (wasMigrated && persistMigration) {
    try {
      await persistMigration(typedLessonPlan);
      log.info("Persisted migrated lesson plan");
    } catch (error) {
      log.error("Failed to persist migrated lesson plan", error);
      throw error;
    }
  }

  return { lessonPlan: typedLessonPlan, wasMigrated };
};
