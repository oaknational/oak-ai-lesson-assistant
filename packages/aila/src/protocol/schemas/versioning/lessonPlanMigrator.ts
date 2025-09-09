import { aiLogger } from "@oakai/logger";

import { z } from "zod";

import type { LatestQuiz } from "../quiz";
import { QuizV1Schema, QuizV2Schema } from "../quiz";
import { convertQuizV1ToV2, isQuizV1 } from "../quiz/conversion/quizV1ToV2";

const log = aiLogger("aila:schema");

export type MigrationResult = {
  lessonPlan: Record<string, unknown>;
  wasMigrated: boolean;
};

const LessonPlanInputSchema = z
  .object({
    starterQuiz: z
      .union([
        z.array(z.any()), // V1 format (array)
        z.object({ version: z.string() }).passthrough(), // V2/V3 format (object with string version)
      ])
      .optional(),
    exitQuiz: z
      .union([
        z.array(z.any()), // V1 format (array)
        z.object({ version: z.string() }).passthrough(), // V2/V3 format (object with string version)
      ])
      .optional(),
  })
  .passthrough();

// Schema for quiz data that can be migrated
const MigratableQuizSchema = z.union([QuizV1Schema, QuizV2Schema]);

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
    // v2 => 2
    return parseInt(section.version.replace(/[^0-9]/, ""), 10);
  }

  if (typeof section.version === "number") {
    return section.version;
  }

  throw new Error(`Invalid version for section ${sectionKey}`);
};

export type MigrateLessonPlanArgs = {
  lessonPlan: Record<string, unknown>;
  persistMigration:
    | ((lessonPlan: Record<string, unknown>) => Promise<void>)
    | null;
};

/**
 * Helper to migrate lesson plan quizzes in chat data before parsing
 */
export async function migrateChatData(
  rawChat: unknown,
  persistCallback: MigrateLessonPlanArgs["persistMigration"],
): Promise<{
  lessonPlan: unknown;
  [key: string]: unknown;
}> {
  if (
    !rawChat ||
    typeof rawChat !== "object" ||
    !("lessonPlan" in rawChat) ||
    !rawChat.lessonPlan
  ) {
    throw new Error("Invalid chat data format. Expected lessonPlan key");
  }

  const migrationResult = await migrateLessonPlan({
    lessonPlan: rawChat.lessonPlan as Record<string, unknown>,
    persistMigration: async (migratedLessonPlan) => {
      const updatedChat = {
        ...rawChat,
        lessonPlan: migratedLessonPlan,
      };
      await persistCallback?.(updatedChat);
    },
  });

  // Return chat with migrated lesson plan if migration occurred
  return migrationResult.wasMigrated
    ? { ...rawChat, lessonPlan: migrationResult.lessonPlan }
    : rawChat;
}

export const migrateLessonPlan = async ({
  lessonPlan: originalLessonPlan,
  persistMigration,
}: MigrateLessonPlanArgs): Promise<MigrationResult> => {
  if ("lessonPlan" in originalLessonPlan) {
    throw new Error("Invalid lesson plan format. Not expecting lessonPlan key");
  }

  // Validate input is a valid lesson plan structure
  const parseResult = LessonPlanInputSchema.safeParse(originalLessonPlan);
  if (!parseResult.success) {
    throw new Error(
      `Invalid lesson plan format for migration: ${parseResult.error.message}`,
    );
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

  // Call the persistence callback if provided
  if (wasMigrated && persistMigration) {
    try {
      await persistMigration(lessonPlan);
      log.info("Persisted migrated lesson plan");
    } catch (error) {
      log.error("Failed to persist migrated lesson plan", error);
      throw error;
    }
  }

  return { lessonPlan, wasMigrated };
};
