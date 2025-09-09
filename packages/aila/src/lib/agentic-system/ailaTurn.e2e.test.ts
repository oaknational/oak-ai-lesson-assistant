import OpenAI from "openai";
import { z } from "zod";

import {
  CompletedLessonPlanSchema,
  type LooseLessonPlan,
} from "../../protocol/schema";
import { createOpenAIMessageToUserAgent } from "./agents/messageToUserAgent";
import { createOpenAIPlannerAgent } from "./agents/plannerAgent";
import { createSectionAgentRegistry } from "./agents/sectionAgents/sectionAgentRegistry";
import { ailaTurn } from "./ailaTurn";
import type {
  AilaPersistedState,
  AilaRuntimeContext,
  AilaTurnCallbacks,
  ChatMessage,
} from "./types";

// Allow enough time for real OpenAI calls
jest.setTimeout(250000);

const isComplete = (doc: LooseLessonPlan) => {
  const parseResult = CompletedLessonPlanSchema.safeParse(doc);

  if (!parseResult.success) {
    console.log(parseResult.error?.flatten().fieldErrors);
  }

  return parseResult.success;
};

const runTurn = async (
  persistedState: AilaPersistedState,
  runtime: AilaRuntimeContext,
) => {
  let nextDocCapture: LooseLessonPlan | null = null;
  let messageCapture = "";
  const callbacks: AilaTurnCallbacks = {
    onPlannerComplete: () => void 0,
    onSectionComplete: () => void 0,
    onTurnComplete: ({ nextDoc, ailaMessage }) => {
      nextDocCapture = nextDoc;
      messageCapture = ailaMessage;
      return Promise.resolve();
    },
  };

  await ailaTurn({ persistedState, runtime, callbacks });
  if (!nextDocCapture)
    throw new Error("Turn did not complete with a next document.");

  return { nextDoc: nextDocCapture, ailaMessage: messageCapture };
};

// --- Test -------------------------------------------------------------------

describe("ailaTurn e2e happy path with continue loop", () => {
  test("builds a complete lesson from a short prompt using continue", async () => {
    const userPrompt = "KS4 circle theorems";
    const openai = new OpenAI();
    const runtime: AilaRuntimeContext = {
      config: { mathsQuizEnabled: true },
      plannerAgent: createOpenAIPlannerAgent(openai),
      sectionAgents: createSectionAgentRegistry({ openai }),
      messageToUserAgent: createOpenAIMessageToUserAgent(openai),
      fetchRelevantLessons: () => Promise.resolve([]),
    };

    const messages: ChatMessage[] = [
      { id: "m1", role: "user", content: userPrompt },
    ];

    const persisted: AilaPersistedState = {
      messages,
      initialDocument: {},
      relevantLessons: null,
    };

    let currentDoc: LooseLessonPlan = persisted.initialDocument;
    let iterations = 0;
    const maxIterations = 15;

    while (iterations < maxIterations) {
      const { nextDoc, ailaMessage } = await runTurn(persisted, runtime);

      // Record assistant response and update state for next turn
      persisted.messages.push({
        id: `a${iterations}`,
        role: "assistant",
        content: ailaMessage,
      });
      currentDoc = nextDoc;
      persisted.initialDocument = currentDoc;

      // Check for completion against the strict schema
      if (isComplete(currentDoc)) {
        expect(ailaMessage).toBeTruthy();
        break;
      }

      // Otherwise, ask to continue
      persisted.messages.push({
        id: `u${iterations}`,
        role: "user",
        content: "continue",
      });
      iterations++;
    }

    // Final assertion: we should have completed within the limit
    expect(isComplete(currentDoc)).toBe(true);
  });
});
