import type OpenAI from "openai";
import { z } from "zod";

import type { AilaExecutionContext } from "../../types";
import { executeGenericPromptAgent } from "../executeGenericPromptAgent";
import * as sectionModule from "../sectionToGenericPromptAgent";
import { createSectionAgent } from "./createSectionAgent";

jest.mock("../executeGenericPromptAgent", () => ({
  executeGenericPromptAgent: jest.fn().mockResolvedValue({ data: {} }),
}));

const buildCtx = (overrides: { mathsQuizEnabled: boolean }) =>
  ({
    persistedState: {
      messages: [],
      initialDocument: {},
      relevantLessons: [],
    },
    runtime: {
      plannerAgent: jest.fn(),
      sectionAgents: {},
      messageToUserAgent: jest.fn(),
      fetchRelevantLessons: jest.fn(),
      config: {
        mathsQuizEnabled: overrides.mathsQuizEnabled,
      },
    },
    currentTurn: {
      document: {},
      plannerOutput: null,
      errors: [],
      notes: [],
      stepsExecuted: [],
      relevantLessonsFetched: false,
      relevantLessons: [],
      currentStep: null,
    },
    callbacks: {
      onPlannerComplete: jest.fn(),
      onSectionComplete: jest.fn(),
      onTurnComplete: jest.fn(),
      onTurnFailed: jest.fn(),
    },
  }) as unknown as AilaExecutionContext;

describe("createSectionAgent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("passes a static instructions string straight through", async () => {
    const spy = jest.spyOn(sectionModule, "sectionToGenericPromptAgent");
    const factory = createSectionAgent({
      responseSchema: z.object({ value: z.string() }),
      instructions: "static prompt",
      modelParams: { model: "gpt-4o-mini" },
    });
    const agent = factory({
      id: "test",
      description: "",
      openai: {} as OpenAI,
      contentFromDocument: () => undefined,
    });

    await agent.handler(buildCtx({ mathsQuizEnabled: false }));

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ instructions: "static prompt" }),
      expect.anything(),
    );
    spy.mockRestore();
  });

  it("resolves functional instructions at handler time and selects branch from ctx", async () => {
    const spy = jest.spyOn(sectionModule, "sectionToGenericPromptAgent");
    const factory = createSectionAgent({
      responseSchema: z.object({ value: z.string() }),
      instructions: (ctx) =>
        ctx.runtime.config.mathsQuizEnabled
          ? "MATHS_PROMPT"
          : "STANDARD_PROMPT",
      modelParams: { model: "gpt-4o-mini" },
    });
    const agent = factory({
      id: "test",
      description: "",
      openai: {} as OpenAI,
      contentFromDocument: () => undefined,
    });

    await agent.handler(buildCtx({ mathsQuizEnabled: true }));
    expect(spy).toHaveBeenLastCalledWith(
      expect.objectContaining({ instructions: "MATHS_PROMPT" }),
      expect.anything(),
    );

    await agent.handler(buildCtx({ mathsQuizEnabled: false }));
    expect(spy).toHaveBeenLastCalledWith(
      expect.objectContaining({ instructions: "STANDARD_PROMPT" }),
      expect.anything(),
    );

    spy.mockRestore();
  });

  it("composes the promptTemplateId from the id and variant and carries it on the agent", async () => {
    const spy = jest.spyOn(sectionModule, "sectionToGenericPromptAgent");
    const factory = createSectionAgent({
      responseSchema: z.object({ value: z.string() }),
      instructions: () => ({
        text: "runtime prompt",
        variant: "addOne",
        promptInputs: { buildMode: "addOne" },
      }),
      modelParams: { model: "gpt-4o-mini" },
    });
    const agent = factory({
      id: "starterQuiz--default",
      description: "",
      openai: {} as OpenAI,
      contentFromDocument: () => undefined,
    });

    await agent.handler(buildCtx({ mathsQuizEnabled: false }));

    // The section builder receives the composed id + telemetry...
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        instructions: "runtime prompt",
        promptTemplateId: "starterQuiz--default:addOne",
        promptInputs: expect.objectContaining({ buildMode: "addOne" }),
      }),
      expect.anything(),
    );
    // ...and the built agent carries it through to execution.
    expect(executeGenericPromptAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        agent: expect.objectContaining({
          id: "starterQuiz--default",
          promptTemplateId: "starterQuiz--default:addOne",
        }),
      }),
    );
    spy.mockRestore();
  });
});
