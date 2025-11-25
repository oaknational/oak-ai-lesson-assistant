#!/usr/bin/env tsx

/**
 * Inspection script for quiz generation debugging
 *
 * Usage:
 *   pnpm tsx packages/aila/src/core/quiz/scripts/inspect-lesson-quiz.ts <lessonSlug>
 *   pnpm tsx packages/aila/src/core/quiz/scripts/inspect-lesson-quiz.ts --plan-id <planId>
 *
 * Examples:
 *   pnpm tsx packages/aila/src/core/quiz/scripts/inspect-lesson-quiz.ts circle-theorems-1
 *   pnpm tsx packages/aila/src/core/quiz/scripts/inspect-lesson-quiz.ts --plan-id abc123
 */
import { aiLogger } from "@oakai/logger";

import { ElasticLessonQuizLookup } from "../../services/LessonSlugQuizLookup";
import {
  createElasticsearchClient,
  getQuestionsForLesson,
  lessonSlugToQuestionIds,
} from "../helpers/elasticsearch-helpers";
import {
  getLessonPlanById,
  getLessonSlugFromPlanId,
} from "../helpers/prisma-helpers";

const log = aiLogger("aila:quiz");

async function inspectByLessonSlug(lessonSlug: string) {
  log.info(`\n========================================`);
  log.info(`Inspecting Quiz Data for Lesson: ${lessonSlug}`);
  log.info(`========================================\n`);

  const client = createElasticsearchClient();
  const lookupTable = new ElasticLessonQuizLookup();

  // 1. Check lookup table
  log.info("📚 Checking Lookup Table:");
  const starterQuizIds = await lookupTable.getStarterQuiz(lessonSlug);
  const exitQuizIds = await lookupTable.getExitQuiz(lessonSlug);

  log.info(`  Starter Quiz: ${starterQuizIds.length} questions`);
  log.info(`  Exit Quiz: ${exitQuizIds.length} questions`);

  // 2. Check Elasticsearch directly
  log.info("\n🔍 Checking Elasticsearch Direct Search:");
  const allQuestionIds = await lessonSlugToQuestionIds(client, [lessonSlug]);
  log.info(`  Total questions found: ${allQuestionIds.length}`);

  // 3. Get full question data
  log.info("\n📝 Full Question Data:");
  const questions = await getQuestionsForLesson(client, lessonSlug);

  questions.forEach((q, idx) => {
    log.info(`\n  Question ${idx + 1}:`);
    log.info(`    UID: ${q.questionUid}`);
    log.info(`    Type: ${q.quizPatchType || "unknown"}`);
    log.info(`    Legacy: ${q.isLegacy ? "yes" : "no"}`);
    log.info(`    Text: ${q.text?.substring(0, 80)}...`);
  });

  // 4. Compare lookup table vs direct search
  log.info("\n⚖️  Comparison:");
  const inLookup = new Set([...starterQuizIds, ...exitQuizIds]);
  const inElastic = new Set(allQuestionIds);

  const onlyInLookup = [...inLookup].filter((id) => !inElastic.has(id));
  const onlyInElastic = [...inElastic].filter((id) => !inLookup.has(id));

  if (onlyInLookup.length > 0) {
    log.warn(
      `  ⚠️  ${onlyInLookup.length} questions in lookup but not Elasticsearch`,
    );
  }
  if (onlyInElastic.length > 0) {
    log.warn(
      `  ⚠️  ${onlyInElastic.length} questions in Elasticsearch but not lookup`,
    );
  }
  if (onlyInLookup.length === 0 && onlyInElastic.length === 0) {
    log.info(`  ✅ Lookup table and Elasticsearch are in sync`);
  }

  await client.close();
}

async function inspectByPlanId(planId: string) {
  log.info(`\n========================================`);
  log.info(`Inspecting Quiz Data for Plan ID: ${planId}`);
  log.info(`========================================\n`);

  // 1. Get lesson plan details
  log.info("📋 Lesson Plan Details:");
  const lessonPlan = await getLessonPlanById(planId);

  if (!lessonPlan) {
    log.error(`Lesson plan not found for ID: ${planId}`);
    return;
  }

  const parsedPlan =
    typeof lessonPlan.lessonPlan === "object" && lessonPlan.lessonPlan !== null
      ? (lessonPlan.lessonPlan as { title?: string })
      : {};
  log.info(`  Title: ${parsedPlan.title || "N/A"}`);
  log.info(`  Slug: ${lessonPlan.oakLessonSlug}`);
  log.info(`  Created: ${lessonPlan.createdAt.toISOString()}`);

  // 2. Inspect by slug
  if (lessonPlan.oakLessonSlug) {
    await inspectByLessonSlug(lessonPlan.oakLessonSlug);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    log.error(
      "Usage: inspect-lesson-quiz.ts <lessonSlug> or --plan-id <planId>",
    );
    process.exit(1);
  }

  if (args[0] === "--plan-id") {
    if (!args[1]) {
      log.error("Plan ID required after --plan-id flag");
      process.exit(1);
    }
    await inspectByPlanId(args[1]);
  } else {
    await inspectByLessonSlug(args[0]!);
  }
}

main().catch((error) => {
  log.error("Script failed:", error);
  process.exit(1);
});
