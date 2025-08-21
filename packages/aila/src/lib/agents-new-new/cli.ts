#!/usr/bin/env ts-node
import { createOpenAIClient } from "@oakai/core/src/llm/openai";

import { compare } from "fast-json-patch/index.mjs";
import readline from "readline";

import { ailaTurn } from "./ailaTurn";
import { executeGenericPromptAgent } from "./executeGenericPromptAgent";
import { createPlannerAgent } from "./plannerAgent/createPlannerAgent";
import { createPresentationAgent } from "./presentationAgent/createPresentationAgent";
import { createSectionAgentRegistry } from "./sectionAgent/sectionAgentRegistry";
import type {
  AilaPersistedState,
  AilaRuntimeContext,
  PlannerAgentProps,
  PresentationAgentProps,
} from "./types";

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
  // eslint-disable-next-line no-console
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

  const plannerAgent = (props: PlannerAgentProps) =>
    executeGenericPromptAgent({
      agent: createPlannerAgent(props),
      openAIClient,
    });

  const presentationAgent = (props: PresentationAgentProps) =>
    executeGenericPromptAgent({
      agent: createPresentationAgent(props),
      openAIClient,
    });

  const sectionAgents = createSectionAgentRegistry({
    openai: openAIClient,
  });

  let persistedState: AilaPersistedState = {
    initialDocument: {},
    messages: [{ role: "user", content: initialUserMessage }],
    relevantLessons: null,
  };

  const runtime: AilaRuntimeContext = {
    plannerAgent,
    presentationAgent,
    sectionAgents,
    fetchRelevantLessons: () => Promise.resolve([]),
    config: { mathsQuizEnabled: true },
  };

  let shouldContinue = true;

  while (shouldContinue) {
    // Run the interactive agent loop
    const result = await ailaTurn({
      persistedState,
      runtime,
    });

    // eslint-disable-next-line no-console
    console.log(compare(persistedState, result.persistedState));
    // eslint-disable-next-line no-console
    console.log(
      "ASSISTANT:",
      result.persistedState.messages.slice(-1)[0]?.content,
    );

    // Update the document with the latest version
    persistedState = result.persistedState;
    persistedState.initialDocument = result.currentTurn.document;

    // Ask if the user wants to continue
    const userInput = await ask("USER: ");
    persistedState.messages.push({
      role: "user",
      content: userInput,
    });
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Error:", err);
  process.exit(1);
});
