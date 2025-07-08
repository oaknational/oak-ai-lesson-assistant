import type { Prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import { z } from "zod";

import type { QuizV1, QuizV2 } from "../../protocol/schemas/quiz";
import { QuizV1Schema, QuizV2Schema } from "../../protocol/schemas/quiz";
import {
  convertQuizV1ToV2,
  isQuizV1,
} from "../../protocol/schemas/quiz/conversion/quizV1ToV2";

const log = aiLogger("aila:protocol");

// Schema for data that contains a lesson plan with quizzes
// The lessonPlan key is required to ensure we're upgrading the right data structure
const UpgradableDataSchema = z
  .object({
    lessonPlan: z
      .object({
        starterQuiz: z.union([QuizV1Schema, QuizV2Schema]).optional(),
        exitQuiz: z.union([QuizV1Schema, QuizV2Schema]).optional(),
      })
      .passthrough(),
  })
  .passthrough();

type UpgradableData = z.infer<typeof UpgradableDataSchema>;

export type UpgradeOptions = {
  data: Prisma.JsonValue;
  persistUpgrade: ((upgradedData: UpgradableData) => Promise<void>) | null;
};

export type UpgradeResult = {
  data: Prisma.JsonValue;
  wasUpgraded: boolean;
};

/**
 * Upgrades V1 quizzes to V2 format in any data structure containing a lesson plan
 *
 * @param options.data - The data to check and potentially upgrade (from Prisma JSON column)
 * @param options.persistUpgrade - Optional callback to persist upgraded data
 * @returns The upgraded data (or original if no upgrade needed)
 * @throws Error if data doesn't have a lessonPlan property
 */
export async function upgradeQuizzes(
  options: UpgradeOptions,
): Promise<UpgradeResult> {
  const { data, persistUpgrade } = options;

  // Try to parse as upgradable data
  const parseResult = UpgradableDataSchema.safeParse(data);
  if (!parseResult.success) {
    throw new Error(
      "Invalid data structure for quiz upgrade: Expected an object with a 'lessonPlan' property.",
    );
  }

  const parsed: UpgradableData = parseResult.data;
  const { starterQuiz, exitQuiz } = parsed.lessonPlan;

  // Check if any upgrades are needed
  const needsStarterUpgrade = isQuizV1(starterQuiz);
  const needsExitUpgrade = isQuizV1(exitQuiz);

  if (!needsStarterUpgrade && !needsExitUpgrade) {
    return { data, wasUpgraded: false };
  }

  // Perform upgrades
  const upgradedLessonPlan = {
    ...parsed.lessonPlan,
    ...(needsStarterUpgrade && starterQuiz
      ? { starterQuiz: convertQuizV1ToV2(starterQuiz) }
      : {}),
    ...(needsExitUpgrade && exitQuiz
      ? { exitQuiz: convertQuizV1ToV2(exitQuiz) }
      : {}),
  };

  const upgradedData = {
    ...parsed,
    lessonPlan: upgradedLessonPlan,
  };

  // Log what was upgraded
  if (needsStarterUpgrade) {
    log.info("Upgraded starterQuiz from V1 to V2");
  }
  if (needsExitUpgrade) {
    log.info("Upgraded exitQuiz from V1 to V2");
  }

  // Call the persistence callback if provided
  if (persistUpgrade) {
    try {
      await persistUpgrade(upgradedData);
      log.info("Persisted upgraded data");
    } catch (error) {
      log.error("Failed to persist upgraded data", error);
      throw error;
    }
  }

  return {
    data: upgradedData,
    wasUpgraded: true,
  };
}
