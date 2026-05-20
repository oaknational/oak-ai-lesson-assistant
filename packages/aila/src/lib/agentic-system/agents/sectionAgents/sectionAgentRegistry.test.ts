import type OpenAI from "openai";

import { createSectionAgentRegistry } from "./sectionAgentRegistry";

const mockOpenAI = {} as OpenAI;
const mockCustomHandlers = {
  "starterQuiz--maths": jest.fn(),
  "exitQuiz--maths": jest.fn(),
};

describe("createSectionAgentRegistry — quiz mode agents", () => {
  it.each([
    "starterQuiz--addOne",
    "starterQuiz--rewriteOne",
    "exitQuiz--addOne",
    "exitQuiz--rewriteOne",
  ] as const)("registers %s", (agentId) => {
    const registry = createSectionAgentRegistry({
      openai: mockOpenAI,
      customAgentHandlers: mockCustomHandlers,
    });
    expect(registry[agentId]).toBeDefined();
  });
});
