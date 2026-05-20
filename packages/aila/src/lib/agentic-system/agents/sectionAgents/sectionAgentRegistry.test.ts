import type OpenAI from "openai";

import { createSectionAgentRegistry } from "./sectionAgentRegistry";

const mockOpenAI = {} as OpenAI;
const mockCustomHandlers = {
  "starterQuiz--maths": jest.fn(),
  "exitQuiz--maths": jest.fn(),
};

describe("createSectionAgentRegistry — quiz mode agents", () => {
  it("registers starterQuiz--addOne", () => {
    const registry = createSectionAgentRegistry({
      openai: mockOpenAI,
      customAgentHandlers: mockCustomHandlers,
    });
    expect(registry["starterQuiz--addOne"]).toBeDefined();
  });

  it("registers starterQuiz--rewriteOne", () => {
    const registry = createSectionAgentRegistry({
      openai: mockOpenAI,
      customAgentHandlers: mockCustomHandlers,
    });
    expect(registry["starterQuiz--rewriteOne"]).toBeDefined();
  });

  it("registers exitQuiz--addOne", () => {
    const registry = createSectionAgentRegistry({
      openai: mockOpenAI,
      customAgentHandlers: mockCustomHandlers,
    });
    expect(registry["exitQuiz--addOne"]).toBeDefined();
  });

  it("registers exitQuiz--rewriteOne", () => {
    const registry = createSectionAgentRegistry({
      openai: mockOpenAI,
      customAgentHandlers: mockCustomHandlers,
    });
    expect(registry["exitQuiz--rewriteOne"]).toBeDefined();
  });
});
