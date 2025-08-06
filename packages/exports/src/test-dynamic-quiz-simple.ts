#!/usr/bin/env tsx
import { aiLogger } from "@oakai/logger";

import { getDocsClient } from "./gSuite/docs/client";
import {
  QuestionData,
  getQuestionHandler,
} from "./gSuite/docs/questionHandlers";
import { googleDrive } from "./gSuite/drive/client";
import { copyTemplate } from "./gSuite/drive/copyTemplate";

const log = aiLogger("test-dynamic-quiz");

async function testDynamicQuizSimple() {
  log.info("Testing dynamic quiz sections (simple version)...");

  // Test with all question types including multiple choice
  const questions: QuestionData[] = [
    {
      type: "multiple-choice",
      question: "What is the capital of France?",
      answers: ["Paris", "London", "Berlin"],
    },
    {
      type: "short-answer",
      question: "What is photosynthesis?",
    },
    {
      type: "order",
      question:
        "Put these planets in order from closest to furthest from the Sun:",
      items: ["Earth", "Mercury", "Mars", "Venus"],
    },
    {
      type: "match",
      question: "Match the countries with their capitals:",
      pairs: [
        { left: "UK", right: "London" },
        { left: "France", right: "Paris" },
        { left: "Germany", right: "Berlin" },
        { left: "Italy", right: "Rome" },
      ],
    },
  ];

  try {
    const googleDocs = await getDocsClient();

    // Copy template to playground folder
    const templateId = process.env.GOOGLE_DOCS_QUIZ_TEMPLATE_ID; // Using quiz template
    if (!templateId) {
      throw new Error("GOOGLE_DOCS_QUIZ_TEMPLATE_ID not set");
    }

    const copyResult = await copyTemplate({
      drive: googleDrive,
      templateId,
      newFileName: `Dynamic Quiz Test - ${new Date().toISOString()}`,
      // folderId will default to GOOGLE_DRIVE_OUTPUT_FOLDER_ID from env
    });

    if ("error" in copyResult) {
      throw new Error(`Failed to copy template: ${copyResult.message}`);
    }

    const documentId = copyResult.data.fileCopyId;
    log.info(`Created test document in playground folder: ${documentId}`);

    // Process each question individually to see what's happening
    for (const [index, question] of questions.entries()) {
      log.info(`Processing question ${index + 1}: ${question.type}`);

      // Use a very large index to append at end
      const LARGE_INDEX = 999999;

      // Get handler and generate requests
      const handler = getQuestionHandler(question.type);
      const requests = handler.extractAndPrepareContent(question, LARGE_INDEX, index + 1);

      log.info(`Generated ${requests.length} requests for ${question.type}`);

      // No header needed - question number is in the question text
      const allRequests = requests;

      // Execute requests for this question
      if (allRequests.length > 0) {
        try {
          await googleDocs.documents.batchUpdate({
            documentId,
            requestBody: { requests: allRequests },
          });
          log.info(`✅ Successfully added question ${index + 1}`);
        } catch (error) {
          log.error(`❌ Failed to add question ${index + 1}:`, error);
        }
      }
    }

    log.info(`\n✅ Test complete!`);
    log.info(
      `View document at: https://docs.google.com/document/d/${documentId}/edit`,
    );
  } catch (error) {
    log.error("Test failed:", error);
  }
}

// Run the test
testDynamicQuizSimple().catch(console.error);
