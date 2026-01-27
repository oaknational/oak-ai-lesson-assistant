#!/usr/bin/env tsx

/**
 * Test script for LLM Quiz Composer
 *
 * Usage:
 *   pnpm tsx packages/aila/src/core/quiz/scripts/test-composer.ts
 *
 * Tests the new composer approach:
 * - Uses MLQuizGeneratorMultiTerm to generate candidate pools
 * - Passes pools to LLMQuizComposer (ignoring reranker ratings)
 * - Shows the selected questions and reasoning
 */
import { aiLogger } from "@oakai/logger";

import { CircleTheoremLesson } from "../../fixtures/CircleTheoremsExampleOutput";
import { MLQuizGeneratorMultiTerm } from "../../generators/MLQuizGeneratorMultiTerm";
import { LLMQuizComposer } from "../../selectors/LLMQuizComposer";

const log = aiLogger("aila:quiz");

async function testComposer() {
  log.info("\n========================================");
  log.info("LLM Quiz Composer Test");
  log.info("========================================\n");

  log.info("Test Lesson Plan:");
  log.info(`  Title: ${CircleTheoremLesson.title}`);
  log.info(`  Key Stage: ${CircleTheoremLesson.keyStage}`);
  log.info(`  Topic: ${CircleTheoremLesson.topic}`);

  // Test both starter and exit quizzes
  for (const quizType of ["/starterQuiz", "/exitQuiz"] as const) {
    log.info(`\n\n${"=".repeat(60)}`);
    log.info(`Testing ${quizType}`);
    log.info(`${"=".repeat(60)}\n`);

    // Show what we're targeting
    if (quizType === "/starterQuiz" && CircleTheoremLesson.priorKnowledge) {
      log.info("Prior Knowledge to assess:");
      CircleTheoremLesson.priorKnowledge.forEach((item, i) => {
        log.info(`  ${i + 1}. ${item}`);
      });
    } else if (
      quizType === "/exitQuiz" &&
      CircleTheoremLesson.keyLearningPoints
    ) {
      log.info("Key Learning Points to assess:");
      CircleTheoremLesson.keyLearningPoints.forEach((item, i) => {
        log.info(`  ${i + 1}. ${item}`);
      });
    }

    try {
      // Step 1: Generate candidate pools
      log.info("\n--- Step 1: Generating Candidate Pools ---\n");
      const generator = new MLQuizGeneratorMultiTerm();
      const pools =
        quizType === "/starterQuiz"
          ? await generator.generateMathsStarterQuizCandidates(
              CircleTheoremLesson,
            )
          : await generator.generateMathsExitQuizCandidates(
              CircleTheoremLesson,
            );

      const totalCandidates = pools.reduce(
        (sum, pool) => sum + pool.questions.length,
        0,
      );
      log.info(
        `Generated ${pools.length} pools with ${totalCandidates} total candidates`,
      );

      pools.forEach((pool, idx) => {
        const query =
          pool.source.type === "mlSemanticSearch"
            ? pool.source.semanticQuery
            : "other";
        log.info(
          `  Pool ${idx + 1}: "${query.substring(0, 50)}..." (${pool.questions.length} questions)`,
        );
      });

      // Step 2: Use composer to select questions
      log.info("\n--- Step 2: Composing Quiz ---\n");
      const composer = new LLMQuizComposer();
      const start = Date.now();
      const selectedQuestions = await composer.selectQuestions(
        pools,
        [], // No ratings - composer ignores them
        CircleTheoremLesson,
        quizType,
      );
      const duration = Date.now() - start;

      log.info(`\nComposition completed in ${duration}ms`);
      log.info(`Selected ${selectedQuestions.length} questions:\n`);

      selectedQuestions.forEach((q, i) => {
        const questionStem = q.question.question || "";
        log.info(
          `${i + 1}. [${q.sourceUid}] ${questionStem.substring(0, 100)}${questionStem.length > 100 ? "..." : ""}`,
        );
        log.info(`   Type: ${q.question.questionType}`);
      });

      // Summary
      log.info("\n--- Summary ---");
      log.info(
        `Input: ${totalCandidates} candidates across ${pools.length} pools`,
      );
      log.info(`Output: ${selectedQuestions.length} selected questions`);
      log.info(`Duration: ${duration}ms`);
    } catch (error) {
      log.error(`Composer test failed for ${quizType}:`, error);
    }
  }

  log.info("\n\n========================================");
  log.info("Test Complete");
  log.info("========================================\n");
}

testComposer().catch((error) => {
  log.error("Script failed:", error);
  process.exit(1);
});
