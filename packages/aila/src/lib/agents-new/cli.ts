#!/usr/bin/env ts-node
import { createOpenAIClient } from "@oakai/core/src/llm/openai";

import readline from "readline";

import type { AilaState } from "./agentRegistry";
import { ailaTurn } from "./ailaTurn";
import { getPromptAgents, getRoutingAgent } from "./promptAgents";

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

  const initialUserMessage = `Create a lesson plan with subject: ${subject} for key stage: ${keyStage}, with title "${title}"`;

  const openAIClient = createOpenAIClient({
    app: "lesson-assistant",
    chatMeta: {
      chatId: "test-chat",
      userId: "test-user",
    },
  });
  let currentState: AilaState = {
    doc: {},
    context: [],
    messages: [
      {
        role: "user",
        content: initialUserMessage,
      },
    ],
    planner: getRoutingAgent({ openAIClient }),
    plan: [],
    agents: getPromptAgents({ openAIClient }), // Replace with actual OpenAI client
    error: null,
  };

  // Optionally, let user enter a starting message

  let shouldContinue = true;

  while (shouldContinue) {
    // Run the interactive agent loop
    const result = await ailaTurn({
      state: currentState,
    });
    console.log(
      "AILA:",
      result.state.messages.findLast((m) => m.role === "assistant")?.content,
    );

    // Update the document with the latest version
    currentState = result.state;

    // Ask if the user wants to continue

    const userInput = await ask("USER: ");
    currentState.messages.push({
      role: "user",
      content: userInput,
    });
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
