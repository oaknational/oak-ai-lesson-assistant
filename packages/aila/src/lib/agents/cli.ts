#!/usr/bin/env ts-node
import readline from "readline";

import type {
  AilaRagRelevantLesson,
  CompletedLessonPlan,
  LooseLessonPlan,
} from "../../protocol/schema";
import { interact } from "./interact";

// Helper to prompt for input
function ask(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    }),
  );
}

async function main() {
  console.log("Welcome to the Aila Lesson Plan CLI\n");

  const subject = await ask("Subject: ");
  const keyStage = await ask("Key Stage: ");
  const title = await ask("Lesson Title: ");

  // You could add more fields here if needed
  let currentDocument: LooseLessonPlan = {
    subject,
    keyStage,
    title,
  };

  // For CLI, use a random or timestamp-based chatId/userId
  const chatId = `cli-${Date.now()}`;
  const userId = `cli-user`;

  // Optionally, let user enter a starting message
  let userMessage =
    (await ask("Enter your initial instruction (or leave blank): ")) ||
    "Let's start creating a lesson plan.";

  let shouldContinue = true;
  const messageHistory: { role: "user" | "assistant"; content: string }[] = [];

  while (shouldContinue) {
    messageHistory.push({
      role: "user",
      content: userMessage,
    });
    // Run the interactive agent loop
    const result = await interact({
      chatId,
      userId,
      initialDocument: currentDocument,
      messageHistory,
      customAgents: {
        mathsStarterQuiz: () => {
          return Promise.resolve([
            {
              question: "What is 2 + 2?",
              answers: ["1", "2", "3", "4"],
              distractors: ["4"],
            },
          ]);
        },
        mathsExitQuiz: () => {
          return Promise.resolve([
            {
              question: "What is 2 + 3?",
              answers: ["2", "3", "4", "5"],
              distractors: ["5"],
            },
          ]);
        },
        fetchRagData: () => {
          // Simulate fetching RAG data
          return Promise.resolve([] as CompletedLessonPlan[]);
        },
      },
      relevantLessons: [] as AilaRagRelevantLesson[],
    });

    // Update the document with the latest version
    currentDocument = result.document || currentDocument;
    messageHistory.push({
      role: "assistant",
      content: result.ailaMessage ?? "No message",
    });

    // Display the current state
    console.log("\nCurrent lesson plan:");
    console.log(JSON.stringify(currentDocument, null, 2));

    console.log("\nAila message:");
    console.log(result.ailaMessage ?? "NO MESSAGE");

    // Ask if the user wants to continue
    const continueResponse = await ask(
      "\nDo you want to add more instructions? (y/n): ",
    );

    if (
      continueResponse.toLowerCase() === "y" ||
      continueResponse.toLowerCase() === "yes"
    ) {
      userMessage = await ask("Enter your next instruction: ");
    } else {
      shouldContinue = false;
    }
  }

  console.log("\nFinal lesson plan document:");
  console.log(JSON.stringify(currentDocument, null, 2));
  console.log("\nThank you for using Aila Lesson Plan CLI!");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
