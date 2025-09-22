import { aiLogger } from "@oakai/logger";

import { type ZodTypeAny, z } from "zod";

import { CompletedLessonPlanSchemaWithoutLength } from "../../schema";
import type { LatestQuiz } from "../quiz";
import { QuizV1Schema, QuizV2Schema, QuizV3Schema } from "../quiz";
import { convertQuizV1ToV2, isQuizV1 } from "../quiz/conversion/quizV1ToV2";
import { convertQuizV2ToV3, isQuizV3 } from "../quiz/conversion/quizV2ToV3";

const log = aiLogger("aila:schema");

export type MigrationResult<TSchema extends ZodTypeAny> = {
  lessonPlan: z.infer<TSchema>;
  wasMigrated: boolean;
};

// Schema for quiz data that can be migrated - accepts V1, V2, and V3 formats
export const MigratableQuizSchema = z.union([
  QuizV1Schema, // Array of V1 questions
  QuizV2Schema, // Object with version "v2" and questions array
  QuizV3Schema, // Object with version "v3" and imageMetadata array
]);

// Proper input schema for lesson plan migration
export const LessonPlanMigrationInputSchema =
  // HACK: This loose type is needed for RAG lessons which can violate length requirements
  //       eg: misconceptions can be an empty array
  CompletedLessonPlanSchemaWithoutLength.partial().extend({
    starterQuiz: MigratableQuizSchema.optional(),
    exitQuiz: MigratableQuizSchema.optional(),
  });

export type LessonPlanMigrationInput = z.infer<
  typeof LessonPlanMigrationInputSchema
>;

const migrateQuiz = (section: unknown): LatestQuiz => {
  const quiz = MigratableQuizSchema.parse(section);
  if (isQuizV3(quiz)) {
    return quiz;
  }
  // Chain migrations: V1→V2→V3 (Latest currently V3)
  const v2Quiz = isQuizV1(quiz) ? convertQuizV1ToV2(quiz) : quiz;
  return convertQuizV2ToV3(v2Quiz);
};

const versionedSections = {
  starterQuiz: {
    key: "starterQuiz" as const,
    latestVersion: 3,
    migrate: migrateQuiz,
  },
  exitQuiz: {
    key: "exitQuiz" as const,
    latestVersion: 3,
    migrate: migrateQuiz,
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

export type MigrateLessonPlanArgs<TSchema extends ZodTypeAny> = {
  lessonPlan: LessonPlanMigrationInput | Record<string, unknown>;
  persistMigration: ((lessonPlan: z.infer<TSchema>) => Promise<void>) | null;
  outputSchema: TSchema;
};

export const migrateLessonPlan = async <TSchema extends ZodTypeAny>({
  lessonPlan: originalLessonPlan,
  persistMigration,
  outputSchema,
}: MigrateLessonPlanArgs<TSchema>): Promise<MigrationResult<TSchema>> => {
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
  const finalParseResult: z.SafeParseReturnType<
    unknown,
    z.infer<TSchema>
  > = outputSchema.safeParse(lessonPlan);
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
