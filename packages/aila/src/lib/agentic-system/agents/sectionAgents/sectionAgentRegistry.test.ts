import type OpenAI from "openai";

import { createSectionAgentRegistry } from "./sectionAgentRegistry";

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
