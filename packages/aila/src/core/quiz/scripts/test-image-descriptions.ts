#!/usr/bin/env tsx

/**
 * Test script for Image Description Service
 *
 * Usage (from packages/aila directory):
 *   pnpm with-env tsx src/core/quiz/scripts/test-image-descriptions.ts
 *
 * Tests:
 * - Extracts images from quiz questions
 * - Generates/retrieves cached descriptions
 * - Shows before/after of image replacement
 */
import { aiLogger } from "@oakai/logger";

import { CircleTheoremLesson } from "../fixtures/CircleTheoremsExampleOutput";
import { MLQuizGeneratorMultiTerm } from "../generators/MLQuizGeneratorMultiTerm";
import type { QuizQuestionPool } from "../interfaces";
import { ImageDescriptionService } from "../services/ImageDescriptionService";

const log = aiLogger("aila:quiz");

async function testImageDescriptions() {
  log.info("\n========================================");
  log.info("Image Description Service Test");
  log.info("========================================\n");

  // Create a modified lesson plan with different key learning points
  const testLesson = {
    ...CircleTheoremLesson,
    keyLearningPoints: [
      "Understanding properties of triangles and their angles",
      "Identifying and calculating angles in quadrilaterals",
      "Using the Pythagorean theorem to solve problems",
      "Working with coordinate geometry and graphing lines",
      "Interpreting and drawing statistical graphs and charts",
    ],
  };

  log.info("Test Lesson Plan:");
  log.info(`  Title: ${testLesson.title}`);
  log.info(`  Key Stage: ${testLesson.keyStage}`);
  log.info(`  Topic: ${testLesson.topic}`);
  log.info(`  Modified Key Learning Points: ${testLesson.keyLearningPoints.length} points\n`);

  // Generate candidate pools using real generator
  log.info("Generating candidate question pools...\n");

  const generator = new MLQuizGeneratorMultiTerm();
  const pools = await generator.generateMathsExitQuizCandidates(testLesson);

  // Find pools with images
  const poolsWithImages = pools.filter((pool) =>
    pool.questions.some((q) => q.question.includes("![image](")),
  );

  if (poolsWithImages.length === 0) {
    log.warn("No pools with images found, using all pools for testing");
  }

  const testPools = poolsWithImages.length > 0 ? poolsWithImages : pools;

  const totalQuestions = testPools.reduce(
    (sum, pool) => sum + pool.questions.length,
    0,
  );
  const questionsWithImages = testPools
    .flatMap((pool) => pool.questions)
    .filter((q) => q.question.includes("![image](")).length;

  log.info(`Using ${testPools.length} pool(s) with ${totalQuestions} questions`);
  log.info(`Found ${questionsWithImages} questions with images\n`);

  // Test the ImageDescriptionService
  log.info("--- Step 1: Extract and Process Images ---\n");

  const imageService = new ImageDescriptionService();
  const startTime = Date.now();

  const { descriptions, cacheHits, cacheMisses, generatedCount } =
    await imageService.getImageDescriptions(testPools);

  const duration = Date.now() - startTime;

  log.info(`\nProcessing complete in ${duration}ms`);
  log.info(`Total images: ${descriptions.size}`);
  log.info(`Cache hits: ${cacheHits}`);
  log.info(`Cache misses: ${cacheMisses}`);
  log.info(`Newly generated: ${generatedCount}\n`);

  // Show all descriptions
  if (descriptions.size > 0) {
    log.info("--- Step 2: All Image Descriptions ---\n");

    Array.from(descriptions.entries()).forEach(([url, description], i) => {
      log.info(`Image ${i + 1}:`);
      log.info(`  URL: ${url}`);
      log.info(`  Description: ${description}\n`);
    });

    // Show before/after replacement
    log.info("--- Step 3: Before/After Replacement ---\n");

    const poolsWithDescriptions =
      ImageDescriptionService.applyDescriptionsToQuestions(
        testPools,
        descriptions,
      );

    // Find first 2 questions with images
    const questionsToShow: Array<{
      original: string;
      replaced: string;
    }> = [];

    for (const pool of testPools) {
      for (let i = 0; i < pool.questions.length && questionsToShow.length < 2; i++) {
        const original = pool.questions[i];
        if (!original?.question.includes("![image](")) continue;

        const poolIndex = testPools.indexOf(pool);
        const replaced = poolsWithDescriptions[poolIndex]?.questions[i];
        if (!replaced) continue;

        questionsToShow.push({
          original: original.question,
          replaced: replaced.question,
        });
      }
    }

    questionsToShow.forEach(({ original, replaced }, i) => {
      log.info(`Question ${i + 1}:`);
      log.info("\nBEFORE:");
      log.info(original.substring(0, 200));
      if (original.length > 200) log.info("...");

      log.info("\nAFTER:");
      log.info(replaced.substring(0, 300));
      if (replaced.length > 300) log.info("...");

      log.info("\n" + "-".repeat(60) + "\n");
    });
  } else {
    log.info("No images found in generated questions\n");
  }

  // Summary
  log.info("--- Summary ---");
  log.info(`Questions processed: ${totalQuestions}`);
  log.info(`Questions with images: ${questionsWithImages}`);
  log.info(`Unique images found: ${descriptions.size}`);
  if (descriptions.size > 0) {
    log.info(
      `Cache efficiency: ${cacheHits}/${descriptions.size} (${((cacheHits / descriptions.size) * 100).toFixed(1)}%)`,
    );
  }
  log.info(`Vision API calls: ${generatedCount}`);
  log.info(`Total duration: ${duration}ms`);

  log.info("\n========================================");
  log.info("Test Complete");
  log.info("========================================\n");
}

testImageDescriptions().catch((error) => {
  log.error("Script failed:", error);
  process.exit(1);
});
