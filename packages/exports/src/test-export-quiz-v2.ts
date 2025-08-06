#!/usr/bin/env tsx
import { aiLogger } from "@oakai/logger";
import { exportDocQuizV2 } from "./exportDocQuizV2";
import type { QuizDocInputData, QuizV2 } from "./schema/input.schema";

const log = aiLogger("test-export-quiz-v2");

async function testExportQuizV2() {
  log.info("Testing V2 quiz export with all question types...");

  // Create a test quiz with all question types
  const testQuiz: QuizV2 = {
    version: "v2",
    questions: [
      {
        questionType: "multiple-choice",
        question: "What is the capital of France?",
        answers: ["Paris"],
        distractors: ["London", "Berlin"],
        hint: null,
      },
      {
        questionType: "short-answer",
        question: "What process do plants use to convert sunlight into energy?",
        answers: ["photosynthesis"],
        hint: null,
      },
      {
        questionType: "order",
        question: "Put these planets in order from closest to furthest from the Sun:",
        answers: ["Mercury", "Venus", "Earth", "Mars"],
        correctOrder: [0, 1, 2, 3],
        hint: null,
      },
      {
        questionType: "match",
        question: "Match the countries with their capitals:",
        answers: [
          ["United Kingdom", "London"],
          ["France", "Paris"],
          ["Germany", "Berlin"],
          ["Italy", "Rome"],
        ],
        hint: null,
      },
    ],
  };

  const inputData: QuizDocInputData = {
    quizType: "exit",
    quiz: testQuiz,
    lessonTitle: "Geography and Science Test",
  };

  try {
    const result = await exportDocQuizV2({
      snapshotId: new Date().toISOString(),
      data: inputData,
      userEmail: "test@example.com",
      onStateChange: (state) => {
        log.info("State change:", state);
      },
    });

    if ("error" in result) {
      log.error("Export failed:", result.error);
    } else {
      log.info("Export successful!");
      log.info("Document URL:", result.data.fileUrl);
    }
  } catch (error) {
    log.error("Test failed:", error);
  }
}

// Run the test
testExportQuizV2().catch(console.error);