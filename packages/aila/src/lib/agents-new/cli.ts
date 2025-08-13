#!/usr/bin/env ts-node
import { createOpenAIClient } from "@oakai/core/src/llm/openai";

import { compare } from "fast-json-patch/index.mjs";
import readline from "readline";

import type { AilaState } from "./agentRegistry";
import { type AilaTurnArgs, ailaTurn } from "./ailaTurn";
import {
  getMessageToUserAgent,
  getPromptAgents,
  getRoutingAgent,
} from "./promptAgents";

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
  const agents = getPromptAgents({ openAIClient });
  let currentState: AilaTurnArgs["state"] = {
    docAtStartOfTurn: {},
    doc: {},
    contextNotes: null,
    relevantLessons: null,
    messages: [
      {
        role: "user",
        content: initialUserMessage,
      },
    ],
    planner: getRoutingAgent({
      openAIClient,
      subAgents: Object.values(agents).map((agent) => ({
        id: agent.id,
        description: agent.description,
      })),
    }),
    plan: [],
    agents,
    messageToUser: getMessageToUserAgent({ openAIClient }),
    refusal: null,
    error: null,
  };

  // Optionally, let user enter a starting message

  let shouldContinue = true;

  while (shouldContinue) {
    // Run the interactive agent loop
    const result = await ailaTurn({
      state: currentState,
    });

    console.log(compare(currentState, result.state));

    // Update the document with the latest version
    currentState = result.state;
    currentState.docAtStartOfTurn = { ...currentState.doc };
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
