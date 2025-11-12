#!/usr/bin/env tsx

/**
 * Create a new placeholder question with proper HasuraQuizQuestion structure
 *
 * This creates QUES-XXXXX-STRICT with correct schema validation for testing.
 * The existing 6,984 QUES-XXXXX-XXXXX records remain untouched.
 *
 * Usage:
 *   pnpm --filter @oakai/aila with-env tsx src/core/quiz/scripts/create-strict-placeholder.ts
 */

import { aiLogger } from "@oakai/logger";

import { Client } from "@elastic/elasticsearch";

const log = aiLogger("aila:quiz");

const QUESTION_UID = "QUES-XXXXX-STRICT";
const INDEX = "quiz-questions-text-only-2025-04-16";

async function createStrictPlaceholder() {
  const client = new Client({
    cloud: {
      id: process.env.I_DOT_AI_ELASTIC_CLOUD_ID as string,
    },
    auth: {
      apiKey: process.env.I_DOT_AI_ELASTIC_KEY as string,
    },
  });

  // Check if it already exists
  const existing = await client.search({
    index: INDEX,
    body: {
      query: {
        term: {
          "metadata.questionUid.keyword": QUESTION_UID,
        },
      },
    },
  });

  if ((existing.hits.total as any).value > 0) {
    log.info(`✓ ${QUESTION_UID} already exists (${(existing.hits.total as any).value} records)`);
    return;
  }

  // Create QuizV1 format for text field
  const textContent = {
    question: "placeholder_question_text",
    answers: ["placeholder_answer_text"],
    distractors: [
      "placeholder_distractor_text",
      "placeholder_distractor_text",
      "placeholder_distractor_text",
    ],
    feedback: "placeholder_feedback_text",
    hint: "placeholder_hint_text",
    html: [""],
  };

  // Create proper HasuraQuizQuestion format for raw_json field
  const rawJsonContent = {
    questionId: 99999,
    questionUid: QUESTION_UID,
    questionType: "multiple-choice" as const,
    questionStem: [
      {
        text: "placeholder_question_text",
        type: "text" as const,
      },
    ],
    answers: {
      "multiple-choice": [
        {
          answer: [
            {
              text: "placeholder_answer_text",
              type: "text" as const,
            },
          ],
          answer_is_correct: true,
        },
        {
          answer: [
            {
              text: "placeholder_distractor_text",
              type: "text" as const,
            },
          ],
          answer_is_correct: false,
        },
        {
          answer: [
            {
              text: "placeholder_distractor_text",
              type: "text" as const,
            },
          ],
          answer_is_correct: false,
        },
        {
          answer: [
            {
              text: "placeholder_distractor_text",
              type: "text" as const,
            },
          ],
          answer_is_correct: false,
        },
      ],
    },
    feedback: "placeholder_feedback_text",
    hint: "placeholder_hint_text",
    active: true,
  };

  const document = {
    text: JSON.stringify(textContent),
    metadata: {
      lessonSlug: "placeholder-strict-test",
      questionUid: QUESTION_UID,
      raw_json: JSON.stringify(rawJsonContent),
    },
  };

  log.info("Creating new placeholder document:", QUESTION_UID);
  log.info("Document structure:", JSON.stringify(document, null, 2));

  const response = await client.index({
    index: INDEX,
    body: document,
    refresh: "wait_for", // Make it immediately searchable
  });

  log.info("Index response:", response);
  log.info(`✅ Successfully created ${QUESTION_UID}`);
}

createStrictPlaceholder().catch((error) => {
  log.error("Script failed:", error);
  process.exit(1);
});
