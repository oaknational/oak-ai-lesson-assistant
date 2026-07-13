import type OpenAI from "openai";

import { starterQuizAgent } from ".";
import type { PartialLessonPlan } from "../../../../../protocol/schema";
import { toMultipleChoiceOnlyQuiz } from "../../../quizOperations/toMultipleChoiceOnlyQuiz";
import type {
  AilaExecutionContext,
  SectionAgentRegistry,
} from "../../../types";
import { executeGenericPromptAgent } from "../../executeGenericPromptAgent";

jest.mock("../../executeGenericPromptAgent", () => ({
  executeGenericPromptAgent: jest.fn().mockResolvedValue({ data: {} }),
}));

const document: PartialLessonPlan = {
  title: "Comparing fractions",
  keyStage: "ks2",
  priorKnowledge: ["Pupils can halve shapes"],
  keyLearningPoints: ["A fraction shows parts of a whole"],
  cycle1: {
    title: "Compare unit fractions",
    durationInMinutes: 10,
    explanation: {
      spokenExplanation: "Explain comparing unit fractions.",
      accompanyingSlideDetails: "Two fraction bars",
      imagePrompt: "fraction bars",
      slideText: "Compare unit fractions",
    },
    checkForUnderstanding: [
      {
        question: "Which is larger, 1/2 or 1/4?",
        answers: ["1/2"],
        distractors: ["1/4", "They are equal"],
      },
      {
        question: "Which is smaller, 1/3 or 1/5?",
        answers: ["1/5"],
        distractors: ["1/3", "They are equal"],
      },
    ],
    practice: "Sort fractions by size.",
    feedback: "1/2 is the largest unit fraction.",
  },
};

const buildCtx = (): AilaExecutionContext => ({
  persistedState: {
    messages: [],
    initialDocument: {},
    relevantLessons: [],
    ragFetched: { status: "not_fetched", searchIdentity: null },
  },
  runtime: {
    plannerAgent: jest.fn(),
    // empty stub; the prompt-building path never reads the registry
    sectionAgents: {} as SectionAgentRegistry,
    messageToUserAgent: jest.fn(),
    britishEnglishCorrectorAgent: jest.fn(),
    fetchRelevantLessons: jest.fn(),
    config: { mathsQuizEnabled: false },
  },
  currentTurn: {
    document,
    plannerOutput: null,
    errors: [],
    notes: [],
    stepsExecuted: [],
    relevantLessonsFetched: false,
    relevantLessons: [],
    currentStep: null,
    correctorStats: { attempted: [], notNeeded: [], failed: [] },
  },
  callbacks: {
    onPlannerComplete: jest.fn(),
    onSectionComplete: jest.fn(),
    onRagFetchedChange: jest.fn(),
    onTurnComplete: jest.fn(),
    onTurnFailed: jest.fn(),
  },
});

const runAgentAndGetPromptContents = async (): Promise<string[]> => {
  const agent = starterQuizAgent({
    id: "starterQuiz--default",
    description: "Generates starter quiz questions",
    openai: {} as OpenAI,
    contentFromDocument: (doc) =>
      toMultipleChoiceOnlyQuiz(
        "starterQuiz" in doc ? doc.starterQuiz : undefined,
      ),
  });

  await agent.handler(buildCtx());

  const { calls } = jest.mocked(executeGenericPromptAgent).mock;
  const lastCall = calls[calls.length - 1];
  if (!lastCall) throw new Error("executeGenericPromptAgent was not called");
  return lastCall[0].agent.input.map((message) => message.content);
};

describe("starterQuizAgent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("adds the prior knowledge to assess section to the prompt", async () => {
    const contents = await runAgentAndGetPromptContents();

    const part = contents.find((content) =>
      content.startsWith("## PRIOR KNOWLEDGE TO ASSESS"),
    );
    expect(part).toBeDefined();
    expect(part).toContain("- Pupils can halve shapes");
  });

  it("hides the lesson's teaching content from the current document", async () => {
    const contents = await runAgentAndGetPromptContents();

    const currentDocument = contents.find((content) =>
      content.startsWith("CURRENT DOCUMENT"),
    );
    expect(currentDocument).toBeDefined();
    expect(currentDocument).toContain("Comparing fractions");
    expect(currentDocument).toContain("Pupils can halve shapes");
    expect(currentDocument).not.toContain("A fraction shows parts of a whole");
    expect(currentDocument).not.toContain("Compare unit fractions");
  });
});
