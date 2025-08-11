#!/usr/bin/env tsx
/**
 * Comprehensive test of all quiz layouts using backwards insertion
 */

import { aiLogger } from "@oakai/logger";
import { getDocsClient } from "./gSuite/docs/client";
import {
  generateAllQuizTables,
  generateMultipleChoiceTable,
  generateMatchingPairsTable,
  generateOrderingTable,
  generateShortAnswerQuestion,
} from "./gSuite/docs/quizTableGenerators";

const log = aiLogger("test-all-quiz-layouts");

async function testAllQuizLayouts() {
  log.info("Testing all quiz layouts with backwards insertion...");
  
  const docsApi = await getDocsClient();
  
  // Create a new document
  const createResponse = await docsApi.documents.create({
    requestBody: {
      title: `Test All Quiz Layouts - ${new Date().toISOString()}`,
    },
  });
  
  const documentId = createResponse.data.documentId!;
  log.info("Created document:", documentId);
  
  // Move to shared folder
  const { googleDrive } = await import("./gSuite/drive/client");
  const drive = googleDrive;
  
  try {
    const file = await drive.files.get({
      fileId: documentId,
      fields: 'parents',
    });
    
    await drive.files.update({
      fileId: documentId,
      addParents: "1uZ__V20i2ZOxa6_1irt6iAdcv3C85Tlz",
      removeParents: file.data.parents?.join(','),
      fields: 'id, parents',
    });
    
    log.info("✅ Document moved to shared folder");
  } catch (error) {
    log.error("Failed to move to shared folder:", error);
  }
  
  // Add title and intro
  await docsApi.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: "Quiz: Comprehensive Layout Test\n\n",
          },
        },
      ],
    },
  });
  
  // Read to get insertion point
  const doc = await docsApi.documents.get({ documentId });
  const lastElement = doc.data.body?.content?.[doc.data.body.content.length - 1];
  const insertPoint = (lastElement?.endIndex || 1) - 1;
  
  log.info("Insertion point:", insertPoint);
  
  // Define test questions
  const questions = [
    {
      type: "multiple-choice" as const,
      question: "What is the capital of France?",
      data: {
        answers: ["London", "Paris", "Berlin", "Madrid"],
      },
    },
    {
      type: "match" as const,
      question: "Match the countries to their capitals",
      data: {
        leftItems: ["United Kingdom", "France", "Germany", "Spain"],
        rightItems: ["Berlin", "London", "Madrid", "Paris"],
      },
    },
    {
      type: "order" as const,
      question: "Put these events in chronological order",
      data: {
        items: [
          "World War II",
          "The Renaissance",
          "The Industrial Revolution",
          "The Fall of Rome",
        ],
      },
    },
    {
      type: "short-answer" as const,
      question: "What process do plants use to convert sunlight into energy?",
      data: {
        isInline: false,
      },
    },
    {
      type: "short-answer" as const,
      question: "Plants use _____ to convert sunlight into energy.",
      data: {
        isInline: true,
      },
    },
  ];
  
  // Generate all requests using backwards insertion
  const allRequests = generateAllQuizTables(insertPoint, questions);
  
  log.info(`Generated ${allRequests.length} requests for ${questions.length} questions`);
  
  // Execute all requests in a single batch
  try {
    await docsApi.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: allRequests,
      },
    });
    
    log.info("✅ Success! All quiz layouts created.");
    
    // Read final document to verify
    const finalDoc = await docsApi.documents.get({ documentId });
    const tables = finalDoc.data.body?.content?.filter(
      (element) => element.table
    );
    
    log.info(`Document contains ${tables?.length || 0} tables`);
    
    // Log document URL
    log.info(`📄 Document URL: https://docs.google.com/document/d/${documentId}/edit`);
    
  } catch (error) {
    log.error("❌ Failed to create quiz layouts:", error);
    if (error instanceof Error) {
      log.error("Error details:", error.message);
    }
  }
}

// Test individual generators
async function testIndividualGenerators() {
  log.info("\n--- Testing Individual Generators ---");
  
  const docsApi = await getDocsClient();
  
  // Create test document
  const createResponse = await docsApi.documents.create({
    requestBody: {
      title: `Test Individual Generators - ${new Date().toISOString()}`,
    },
  });
  
  const documentId = createResponse.data.documentId!;
  log.info("Created document:", documentId);
  
  // Move to shared folder
  const { googleDrive } = await import("./gSuite/drive/client");
  const drive = googleDrive;
  
  try {
    const file = await drive.files.get({
      fileId: documentId,
      fields: 'parents',
    });
    
    await drive.files.update({
      fileId: documentId,
      addParents: "1uZ__V20i2ZOxa6_1irt6iAdcv3C85Tlz",
      removeParents: file.data.parents?.join(','),
      fields: 'id, parents',
    });
    
    log.info("✅ Document moved to shared folder");
  } catch (error) {
    log.error("Failed to move to shared folder:", error);
  }
  
  // Get insertion point
  const insertPoint = 1;
  
  // Test each generator separately
  const tests = [
    {
      name: "Multiple Choice",
      generator: () => generateMultipleChoiceTable(
        insertPoint,
        "Which of these is a primary color?",
        1,
        ["Red", "Green", "Purple", "Orange"]
      ),
    },
    {
      name: "Matching Pairs",
      generator: () => generateMatchingPairsTable(
        insertPoint,
        "Match the animals to their sounds",
        2,
        ["Dog", "Cat", "Cow"],
        ["Meow", "Moo", "Woof"]
      ),
    },
    {
      name: "Ordering",
      generator: () => generateOrderingTable(
        insertPoint,
        "Order these numbers from smallest to largest",
        3,
        ["42", "7", "128", "3"]
      ),
    },
    {
      name: "Short Answer (separate line)",
      generator: () => generateShortAnswerQuestion(
        insertPoint,
        "What is the largest planet in our solar system?",
        4,
        false
      ),
    },
    {
      name: "Short Answer (inline)",
      generator: () => generateShortAnswerQuestion(
        insertPoint,
        "The largest planet is _____.",
        5,
        true
      ),
    },
  ];
  
  // Build all requests backwards
  const allRequests: any[] = [];
  for (let i = tests.length - 1; i >= 0; i--) {
    const test = tests[i];
    log.info(`Generating: ${test.name}`);
    const requests = test.generator();
    allRequests.push(...requests);
  }
  
  // Execute batch
  try {
    await docsApi.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: allRequests,
      },
    });
    
    log.info("✅ All individual generators tested successfully!");
    log.info(`📄 Document URL: https://docs.google.com/document/d/${documentId}/edit`);
    
  } catch (error) {
    log.error("❌ Individual generator test failed:", error);
  }
}

// Run both tests
async function runAllTests() {
  await testAllQuizLayouts();
  await testIndividualGenerators();
}

// Execute tests
runAllTests().catch((error) => {
  log.error("Test suite failed:", error);
  process.exit(1);
});