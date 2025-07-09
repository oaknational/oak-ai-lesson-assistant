import { aiLogger } from "@oakai/logger";

import { type Prisma, PrismaClient } from "@prisma/client";

const log = aiLogger("db");
const prisma = new PrismaClient();

/**
 * Test script to create sample data and test the migration
 *
 * Usage:
 * 1. pnpm tsx packages/db/scripts/migrations/test-migration.ts setup
 * 2. pnpm tsx packages/db/scripts/migrations/migrate-quizzes-to-v2.ts --dry-run
 * 3. pnpm tsx packages/db/scripts/migrations/migrate-quizzes-to-v2.ts
 * 4. pnpm tsx packages/db/scripts/migrations/test-migration.ts verify
 * 5. pnpm tsx packages/db/scripts/migrations/test-migration.ts cleanup
 */

const TEST_USER_ID = "test_user_migration";
const TEST_APP_ID = "lesson-planner";

// Sample V1 quiz data
const sampleV1StarterQuiz = [
  {
    question: "What is photosynthesis?",
    answers: ["The process by which plants make their own food using sunlight"],
    distractors: [
      "The process of plant respiration",
      "The way plants absorb water",
      "The method plants use to reproduce",
    ],
  },
  {
    question: "Which gas do plants absorb during photosynthesis?",
    answers: ["Carbon dioxide"],
    distractors: ["Oxygen", "Nitrogen", "Hydrogen"],
  },
];

const sampleV1ExitQuiz = [
  {
    question: "What is the main product of photosynthesis?",
    answers: ["Glucose"],
    distractors: ["Water", "Carbon dioxide", "Nitrogen"],
  },
  {
    question: "Where does photosynthesis occur in plant cells?",
    answers: ["Chloroplasts"],
    distractors: ["Nucleus", "Mitochondria", "Cell wall"],
  },
];

// Sample V2 quiz (already migrated)
const sampleV2Quiz = {
  version: "v2",
  questions: [
    {
      questionType: "multiple-choice",
      question: "This quiz is already in V2 format",
      answers: ["True"],
      distractors: ["False"],
    },
  ],
};

async function setupTestData() {
  log.info("Setting up test data...");

  try {
    // Create test sessions with different quiz configurations
    const sessions = [
      {
        id: "test_session_v1_both",
        app: { connect: { id: TEST_APP_ID } },
        userId: TEST_USER_ID,
        output: {
          lessonPlan: {
            title: "Test Lesson - Both V1 Quizzes",
            starterQuiz: sampleV1StarterQuiz,
            exitQuiz: sampleV1ExitQuiz,
          },
        },
      },
      {
        id: "test_session_v1_starter_only",
        app: { connect: { id: TEST_APP_ID } },
        userId: TEST_USER_ID,
        output: {
          lessonPlan: {
            title: "Test Lesson - V1 Starter Only",
            starterQuiz: sampleV1StarterQuiz,
          },
        },
      },
      {
        id: "test_session_v2_already",
        app: { connect: { id: TEST_APP_ID } },
        userId: TEST_USER_ID,
        output: {
          lessonPlan: {
            title: "Test Lesson - Already V2",
            starterQuiz: sampleV2Quiz,
            exitQuiz: sampleV2Quiz,
          },
        },
      },
      {
        id: "test_session_mixed",
        app: { connect: { id: TEST_APP_ID } },
        userId: TEST_USER_ID,
        output: {
          lessonPlan: {
            title: "Test Lesson - Mixed V1 and V2",
            starterQuiz: sampleV1StarterQuiz,
            exitQuiz: sampleV2Quiz,
          },
        },
      },
      {
        id: "test_session_no_quizzes",
        app: { connect: { id: TEST_APP_ID } },
        userId: TEST_USER_ID,
        output: {
          lessonPlan: {
            title: "Test Lesson - No Quizzes",
          },
        },
      },
    ];

    // Create sessions
    for (const session of sessions) {
      await prisma.appSession.create({
        data: session as Prisma.AppSessionCreateInput,
      });
      log.info(`Created test session: ${session.id}`);
    }

    log.info("Test data setup complete!");
    log.info(
      `Created ${sessions.length} test sessions for user: ${TEST_USER_ID}`,
    );
  } catch (error) {
    log.error("Error setting up test data:", error);
    throw error;
  }
}

async function verifyMigration() {
  log.info("Verifying migration results...");

  try {
    const sessions = await prisma.appSession.findMany({
      where: { userId: TEST_USER_ID },
      orderBy: { id: "asc" },
    });

    let allPassed = true;

    for (const session of sessions) {
      const output = session.output as {
        lessonPlan?: {
          starterQuiz?: unknown;
          exitQuiz?: unknown;
        };
      };
      const lessonPlan = output?.lessonPlan;

      log.info(`\nChecking session: ${session.id}`);

      if (lessonPlan?.starterQuiz) {
        const isV2 =
          typeof lessonPlan.starterQuiz === "object" &&
          !Array.isArray(lessonPlan.starterQuiz) &&
          "version" in lessonPlan.starterQuiz &&
          lessonPlan.starterQuiz.version === "v2";

        if (isV2) {
          log.info("✓ starterQuiz is V2 format");
        } else {
          log.error("✗ starterQuiz is NOT V2 format");
          allPassed = false;
        }
      }

      if (lessonPlan?.exitQuiz) {
        const isV2 =
          typeof lessonPlan.exitQuiz === "object" &&
          !Array.isArray(lessonPlan.exitQuiz) &&
          "version" in lessonPlan.exitQuiz &&
          lessonPlan.exitQuiz.version === "v2";

        if (isV2) {
          log.info("✓ exitQuiz is V2 format");
        } else {
          log.error("✗ exitQuiz is NOT V2 format");
          allPassed = false;
        }
      }
    }

    if (allPassed) {
      log.info("\n✅ All quizzes successfully migrated to V2!");
    } else {
      log.error("\n❌ Some quizzes failed to migrate");
    }
  } catch (error) {
    log.error("Error verifying migration:", error);
    throw error;
  }
}

async function cleanupTestData() {
  log.info("Cleaning up test data...");

  try {
    const result = await prisma.appSession.deleteMany({
      where: { userId: TEST_USER_ID },
    });

    log.info(`Deleted ${result.count} test sessions`);
  } catch (error) {
    log.error("Error cleaning up test data:", error);
    throw error;
  }
}

// Parse command line arguments
const command = process.argv[2];

async function main() {
  try {
    switch (command) {
      case "setup":
        await setupTestData();
        break;
      case "verify":
        await verifyMigration();
        break;
      case "cleanup":
        await cleanupTestData();
        break;
      default:
        log.info("Usage:");
        log.info("  setup   - Create test data with V1 quizzes");
        log.info("  verify  - Check if migration was successful");
        log.info("  cleanup - Remove test data");
        process.exit(1);
    }
  } catch (error) {
    log.error("Script failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  log.error("Unhandled error:", error);
  process.exit(1);
});
