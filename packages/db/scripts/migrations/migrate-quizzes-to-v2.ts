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
  const includeDeleted = process.argv.includes("--include-deleted");
  const showHelp = process.argv.includes("--help");

  if (showHelp) {
    log.info(`
Quiz V1 to V2 Migration

Usage: pnpm tsx migrate-quizzes-to-v2.ts [--dry-run] [--include-deleted]

Options:
  --dry-run          Preview changes without modifying database
  --include-deleted  Also migrate soft-deleted sessions
  --help             Show this help
`);
    process.exit(0);
  }

  const prisma = new PrismaClient();

  log.info(`Starting quiz migration (${isDryRun ? "DRY RUN" : "LIVE"})`);
  if (includeDeleted) {
    log.info("Including deleted sessions");
  }

  try {
    // Find all sessions with quizzes
    // Note: We'll check for quiz presence in the code since Prisma JSON filtering is limited
    const allSessions = await prisma.appSession.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      select: { id: true, output: true },
    });

    // Filter sessions that actually have quizzes
    const sessionsWithQuizzes = allSessions.filter((session) =>
      hasQuizzes(session.output),
    );

    log.info(
      `Found ${allSessions.length} total sessions, ${sessionsWithQuizzes.length} have quizzes`,
    );

    let upgraded = 0;
    let failed = 0;

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

    // Summary
    const unchanged = sessionsWithQuizzes.length - upgraded - failed;

    log.info(`
Migration Summary:
- Total sessions: ${sessionsWithQuizzes.length}
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
