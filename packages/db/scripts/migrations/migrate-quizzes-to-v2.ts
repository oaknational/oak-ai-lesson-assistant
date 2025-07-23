#!/usr/bin/env tsx

/**
 * Quiz V1 to V2 Migration Script
 *
 * Purpose: Migrate legacy quiz format (V1) to new discriminated union format (V2)
 *
 * V1 Format: Array of multiple-choice questions
 * V2 Format: Object with version field and questions array supporting multiple types
 *
 * Safety: Run with --dry-run first to preview changes
 * Note: This migration includes all sessions (including soft-deleted ones)
 */
import { aiLogger } from "@oakai/logger";

import { PrismaClient } from "@prisma/client";

import { upgradeQuizzes } from "../../../aila/src/protocol/schemas/quiz/conversion/lessonPlanQuizMigrator";

const log = aiLogger("db");

function hasQuizzes(output: unknown): boolean {
  if (!output || typeof output !== "object") return false;

  const data = output as {
    lessonPlan?: { starterQuiz?: unknown; exitQuiz?: unknown };
  };
  return Boolean(data.lessonPlan?.starterQuiz || data.lessonPlan?.exitQuiz);
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run");
  const showHelp = process.argv.includes("--help");

  if (showHelp) {
    log.info(`
Quiz V1 to V2 Migration

Usage: pnpm tsx migrate-quizzes-to-v2.ts [--dry-run]

Options:
  --dry-run          Preview changes without modifying database
  --help             Show this help

Note: This migration includes all sessions (including soft-deleted ones)
`);
    process.exit(0);
  }

  const prisma = new PrismaClient();

  log.info(`Starting quiz migration (${isDryRun ? "DRY RUN" : "LIVE"})`);
  log.info("Including all sessions (including deleted)");

  try {
    const pageSize = 100;
    let totalSessions = 0;
    let totalWithQuizzes = 0;
    let upgraded = 0;
    let failed = 0;
    let skip = 0;

    // Process sessions in batches
    while (true) {
      const batch = await prisma.appSession.findMany({
        where: { appId: "lesson-planner" },
        select: { id: true, output: true },
        skip,
        take: pageSize,
        orderBy: { id: "asc" }, // Ensure consistent ordering for pagination
      });

      if (batch.length === 0) {
        break; // No more records
      }

      totalSessions += batch.length;

      // Filter sessions that actually have quizzes
      const sessionsWithQuizzes = batch.filter((session) =>
        hasQuizzes(session.output),
      );

      totalWithQuizzes += sessionsWithQuizzes.length;

      log.info(
        `Processing batch starting at offset ${skip}: ${batch.length} sessions, ${sessionsWithQuizzes.length} with quizzes`,
      );

      for (const session of sessionsWithQuizzes) {
        try {
          const result = await upgradeQuizzes({
            data: session.output,
            persistUpgrade: async (upgradedData) => {
              if (isDryRun) {
                log.info(`${session.id}: Would upgrade (dry run)`);
                return;
              }

              await prisma.appSession.update({
                where: { id: session.id },
                data: { output: upgradedData as object },
              });
              log.info(`${session.id}: Upgraded`);
            },
          });

          if (result.wasUpgraded) {
            upgraded++;
          }
        } catch (error) {
          failed++;
          log.error(`${session.id}: Failed`, error);

          // In production, you might want to stop on first error
          if (!isDryRun) {
            throw new Error(`Migration failed at session ${session.id}`);
          }
        }
      }

      skip += pageSize;
    }

    // Summary
    const unchanged = totalWithQuizzes - upgraded - failed;

    log.info(`
Migration Summary:
- Total sessions processed: ${totalSessions}
- Sessions with quizzes: ${totalWithQuizzes}
- Upgraded: ${upgraded}
- Already V2: ${unchanged}
- Failed: ${failed}
${isDryRun ? "\nDRY RUN - No changes made" : ""}
`);

    if (failed > 0 && !isDryRun) {
      throw new Error(`Migration completed with ${failed} errors`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  log.error("Migration failed:", error);
  process.exit(1);
});
