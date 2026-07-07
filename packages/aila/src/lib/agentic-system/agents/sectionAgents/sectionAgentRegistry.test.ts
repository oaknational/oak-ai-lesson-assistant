import type OpenAI from "openai";

import type { AilaExecutionContext } from "../../types";
import * as promptModule from "../sectionToGenericPromptAgent";
import { createSectionAgentRegistry } from "./sectionAgentRegistry";

jest.mock("../executeGenericPromptAgent", () => ({
  executeGenericPromptAgent: jest
    .fn()
    .mockResolvedValue({ error: null, data: {} }),
}));

const mockOpenAI = {} as OpenAI;
const mockCustomHandlers = {
  "starterQuiz--maths": jest.fn(),
  "exitQuiz--maths": jest.fn(),
};

describe("createSectionAgentRegistry — quiz agents", () => {
  it.each([
    "starterQuiz--default",
    "starterQuiz--maths",
    "exitQuiz--default",
    "exitQuiz--maths",
  ] as const)("registers %s", (agentId) => {
    const registry = createSectionAgentRegistry({
      openai: mockOpenAI,
      customAgentHandlers: mockCustomHandlers,
    });
    expect(registry[agentId]).toBeDefined();
  });
});

describe("createSectionAgentRegistry — cycle context", () => {
  it("uses cycle2 as the current value when generating cycle2", async () => {
    const spy = jest.spyOn(promptModule, "sectionToGenericPromptAgent");
    const registry = createSectionAgentRegistry({
      openai: mockOpenAI,
      customAgentHandlers: mockCustomHandlers,
    });
    const ctx = buildCycleCtx("cycle2");

    await registry["cycle--default"].handler(ctx);

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        currentValue: expect.objectContaining({ title: "Existing cycle 2" }),
      }),
      expect.anything(),
    );
    const promptProps = spy.mock.calls[0]?.[0];
    const extraInput = promptProps?.extraInputFromCtx?.(ctx) ?? [];
    expect(JSON.stringify(extraInput)).toContain(
      "Explain how organelles work together",
    );
    spy.mockRestore();
  });

  it("uses cycle3 as the current value when generating cycle3", async () => {
    const spy = jest.spyOn(promptModule, "sectionToGenericPromptAgent");
    const registry = createSectionAgentRegistry({
      openai: mockOpenAI,
      customAgentHandlers: mockCustomHandlers,
    });

    await registry["cycle--default"].handler(buildCycleCtx("cycle3"));

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        currentValue: expect.objectContaining({ title: "Existing cycle 3" }),
      }),
      expect.anything(),
    );
    spy.mockRestore();
  });
});

function buildCycleCtx(
  sectionKey: "cycle1" | "cycle2" | "cycle3",
): AilaExecutionContext {
  return {
    persistedState: {
      messages: [],
      initialDocument: {},
      relevantLessons: [],
      ragFetched: { status: "not_fetched", searchIdentity: null },
    },
    runtime: {
      plannerAgent: jest.fn(),
      sectionAgents: {} as AilaExecutionContext["runtime"]["sectionAgents"],
      messageToUserAgent: jest.fn(),
      britishEnglishCorrectorAgent: jest.fn(),
      fetchRelevantLessons: jest.fn(),
      config: { mathsQuizEnabled: false },
    },
    currentTurn: {
      document: {
        learningCycles: [
          "Identify the parts of a plant cell",
          "Explain how organelles work together",
          "Evaluate plant cell adaptations",
        ],
        cycle1: makeCycle("Existing cycle 1"),
        cycle2: makeCycle("Existing cycle 2"),
        cycle3: makeCycle("Existing cycle 3"),
      },
      plannerOutput: null,
      errors: [],
      notes: [],
      stepsExecuted: [],
      relevantLessonsFetched: false,
      relevantLessons: [],
      currentStep: {
        type: "section",
        sectionKey,
        action: "generate",
        sectionInstructions: null,
      },
      correctorStats: { attempted: [], notNeeded: [], failed: [] },
    },
    callbacks: {
      onPlannerComplete: jest.fn(),
      onSectionComplete: jest.fn(),
      onRagFetchedChange: jest.fn(),
      onTurnComplete: jest.fn(),
      onTurnFailed: jest.fn(),
    },
  };
}

function makeCycle(title: string) {
  return {
    title,
    durationInMinutes: 10,
    explanation: {
      spokenExplanation: ["Explain the key idea"],
      accompanyingSlideDetails: "A diagram",
      imagePrompt: "diagram",
      slideText: "Key idea",
    },
    checkForUnderstanding: [
      {
        question: "Question 1?",
        answers: ["Answer"],
        distractors: ["Wrong 1", "Wrong 2"],
      },
      {
        question: "Question 2?",
        answers: ["Answer"],
        distractors: ["Wrong 1", "Wrong 2"],
      },
    ],
    practice: "Complete the practice task.",
    feedback: "Check against the model answer.",
  };
}
