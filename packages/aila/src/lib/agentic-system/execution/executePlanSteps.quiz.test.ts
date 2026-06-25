import type { LatestQuiz, LatestQuizQuestion } from "../../../protocol/schema";
import { ailaTurn } from "../ailaTurn";
import type {
  AilaPersistedState,
  AilaRuntimeContext,
  AilaTurnCallbacks,
  SectionAgentRegistry,
} from "../types";

const makeQuestion = (text: string): LatestQuizQuestion => ({
  questionType: "multiple-choice",
  question: text,
  hint: null,
  answers: ["Correct"],
  distractors: ["Wrong A", "Wrong B"],
});

const q1 = makeQuestion("What is 1+1?");
const q2 = makeQuestion("What colour is the sky?");
const q3 = makeQuestion("How many sides does a triangle have?");

const starterQuiz: LatestQuiz = {
  version: "v3",
  questions: [q1, q2, q3],
  imageMetadata: [],
};

function makeCallbacks(): AilaTurnCallbacks {
  return {
    onPlannerComplete: jest.fn(),
    onSectionComplete: jest.fn(),
    onTurnComplete: jest.fn().mockResolvedValue(undefined),
    onTurnFailed: jest.fn().mockResolvedValue(undefined),
    onRagFetchedChange: jest.fn().mockResolvedValue(undefined),
  };
}

function makePersistedState(): AilaPersistedState {
  return {
    messages: [
      {
        id: "u1",
        role: "user",
        content: "Remove question 2 from the starter quiz",
      },
    ],
    initialDocument: { starterQuiz },
    relevantLessons: null,
    ragFetched: { status: "not_fetched", searchIdentity: null },
  };
}

function makeRuntime(
  overrides: Partial<AilaRuntimeContext> = {},
): AilaRuntimeContext {
  return {
    config: { mathsQuizEnabled: false },
    plannerAgent: jest.fn(),
    sectionAgents: {} as unknown as SectionAgentRegistry,
    messageToUserAgent: jest.fn().mockResolvedValue({
      error: null,
      data: { message: "Done" },
    }),
    britishEnglishCorrectorAgent: jest.fn(),
    fetchRelevantLessons: jest.fn().mockResolvedValue([]),
    ...overrides,
  };
}

function getUpdatedStarterQuiz(
  callbacks: AilaTurnCallbacks,
): LatestQuiz | undefined {
  const call = jest.mocked(callbacks.onTurnComplete).mock.calls[0]?.[0];
  return call?.document?.starterQuiz;
}

describe("executePlanSteps — quiz dispatch intercept", () => {
  describe("REGENERATE_SECTION", () => {
    it("calls the section agent and replaces the quiz when itemIntent action is REGENERATE_SECTION", async () => {
      const regeneratedQuiz = {
        version: "v3" as const,
        questions: [makeQuestion("Completely new question")],
        imageMetadata: [],
      };
      const sectionAgent = jest.fn().mockResolvedValue({
        error: null,
        data: regeneratedQuiz,
      });
      const callbacks = makeCallbacks();

      const runtime = makeRuntime({
        plannerAgent: jest.fn().mockResolvedValue({
          error: null,
          data: {
            decision: "plan",
            parsedUserMessage: "Generate a new quiz",
            plan: [
              {
                type: "section",
                sectionKey: "starterQuiz",
                action: "generate",
                sectionInstructions: null,
                itemIntent: {
                  action: "REGENERATE_SECTION",
                  position: null,
                },
              },
            ],
          },
        }),
        sectionAgents: {
          "starterQuiz--default": {
            id: "starterQuiz--default",
            description: "starter quiz",
            handler: sectionAgent,
          },
        } as unknown as SectionAgentRegistry,
      });

      await ailaTurn({
        persistedState: makePersistedState(),
        runtime,
        callbacks,
      });

      expect(sectionAgent).toHaveBeenCalledTimes(1);
      const updatedQuiz = getUpdatedStarterQuiz(callbacks);
      expect(updatedQuiz?.questions).toEqual(regeneratedQuiz.questions);
    });
  });

  describe("ADD_ITEM", () => {
    it("calls the section agent and appends the new question at the end", async () => {
      const newQuestion = makeQuestion("What is photosynthesis?");
      const sectionAgent = jest.fn().mockResolvedValue({
        error: null,
        data: {
          version: "v3",
          questions: [newQuestion],
          imageMetadata: [],
        },
      });
      const callbacks = makeCallbacks();

      const runtime = makeRuntime({
        plannerAgent: jest.fn().mockResolvedValue({
          error: null,
          data: {
            decision: "plan",
            parsedUserMessage: "Add a question to the starter quiz",
            plan: [
              {
                type: "section",
                sectionKey: "starterQuiz",
                action: "generate",
                sectionInstructions: null,
                itemIntent: {
                  action: "ADD_ITEM",
                  position: null,
                },
              },
            ],
          },
        }),
        sectionAgents: {
          "starterQuiz--default": {
            id: "starterQuiz--default",
            description: "starter quiz",
            handler: sectionAgent,
          },
        } as unknown as SectionAgentRegistry,
      });

      await ailaTurn({
        persistedState: makePersistedState(),
        runtime,
        callbacks,
      });

      expect(sectionAgent).toHaveBeenCalledTimes(1);
      const updatedQuiz = getUpdatedStarterQuiz(callbacks);
      expect(updatedQuiz?.questions).toHaveLength(4);
      expect(updatedQuiz?.questions[3]).toEqual(newQuestion);
    });

    it("inserts the new question at the given 1-indexed position", async () => {
      const newQuestion = makeQuestion("Inserted at position 2");
      const sectionAgent = jest.fn().mockResolvedValue({
        error: null,
        data: {
          version: "v3",
          questions: [newQuestion],
          imageMetadata: [],
        },
      });
      const callbacks = makeCallbacks();

      const runtime = makeRuntime({
        plannerAgent: jest.fn().mockResolvedValue({
          error: null,
          data: {
            decision: "plan",
            parsedUserMessage: "Add a question at position 2",
            plan: [
              {
                type: "section",
                sectionKey: "starterQuiz",
                action: "generate",
                sectionInstructions: null,
                itemIntent: {
                  action: "ADD_ITEM",
                  position: 2,
                },
              },
            ],
          },
        }),
        sectionAgents: {
          "starterQuiz--default": {
            id: "starterQuiz--default",
            description: "starter quiz",
            handler: sectionAgent,
          },
        } as unknown as SectionAgentRegistry,
      });

      await ailaTurn({
        persistedState: makePersistedState(),
        runtime,
        callbacks,
      });

      const updatedQuiz = getUpdatedStarterQuiz(callbacks);
      expect(updatedQuiz?.questions).toHaveLength(4);
      expect(updatedQuiz?.questions[1]).toEqual(newQuestion);
      expect(updatedQuiz?.questions[0]).toEqual(q1);
      expect(updatedQuiz?.questions[2]).toEqual(q2);
    });

    it("produces a 1-question quiz when the quiz was empty", async () => {
      const newQuestion = makeQuestion("First question ever");
      const sectionAgent = jest.fn().mockResolvedValue({
        error: null,
        data: {
          version: "v3",
          questions: [newQuestion],
          imageMetadata: [],
        },
      });
      const callbacks = makeCallbacks();

      const emptyState: AilaPersistedState = {
        messages: [
          {
            id: "u1",
            role: "user",
            content: "Add a question to the starter quiz",
          },
        ],
        initialDocument: {
          starterQuiz: { version: "v3", questions: [], imageMetadata: [] },
        },
        relevantLessons: null,
        ragFetched: { status: "not_fetched", searchIdentity: null },
      };

      const runtime = makeRuntime({
        plannerAgent: jest.fn().mockResolvedValue({
          error: null,
          data: {
            decision: "plan",
            parsedUserMessage: "Add a question",
            plan: [
              {
                type: "section",
                sectionKey: "starterQuiz",
                action: "generate",
                sectionInstructions: null,
                itemIntent: {
                  action: "ADD_ITEM",
                  position: null,
                },
              },
            ],
          },
        }),
        sectionAgents: {
          "starterQuiz--default": {
            id: "starterQuiz--default",
            description: "starter quiz",
            handler: sectionAgent,
          },
        } as unknown as SectionAgentRegistry,
      });

      await ailaTurn({ persistedState: emptyState, runtime, callbacks });

      const updatedQuiz = getUpdatedStarterQuiz(callbacks);
      expect(updatedQuiz?.questions).toHaveLength(1);
      expect(updatedQuiz?.questions[0]).toEqual(newQuestion);
    });
  });

  describe("CHANGE_ITEM", () => {
    it("calls the section agent and replaces the question at the given 1-indexed position", async () => {
      const replacement = makeQuestion("Harder version of question 2");
      const sectionAgent = jest.fn().mockResolvedValue({
        error: null,
        data: {
          version: "v3",
          questions: [replacement],
          imageMetadata: [],
        },
      });
      const callbacks = makeCallbacks();

      const runtime = makeRuntime({
        plannerAgent: jest.fn().mockResolvedValue({
          error: null,
          data: {
            decision: "plan",
            parsedUserMessage: "Change question 2 to be harder",
            plan: [
              {
                type: "section",
                sectionKey: "starterQuiz",
                action: "generate",
                sectionInstructions: null,
                itemIntent: {
                  action: "CHANGE_ITEM",
                  position: 2,
                },
              },
            ],
          },
        }),
        sectionAgents: {
          "starterQuiz--default": {
            id: "starterQuiz--default",
            description: "starter quiz",
            handler: sectionAgent,
          },
        } as unknown as SectionAgentRegistry,
      });

      await ailaTurn({
        persistedState: makePersistedState(),
        runtime,
        callbacks,
      });

      expect(sectionAgent).toHaveBeenCalledTimes(1);
      const updatedQuiz = getUpdatedStarterQuiz(callbacks);
      expect(updatedQuiz?.questions).toHaveLength(3);
      expect(updatedQuiz?.questions[0]).toEqual(q1);
      expect(updatedQuiz?.questions[1]).toEqual(replacement);
      expect(updatedQuiz?.questions[2]).toEqual(q3);
    });
  });

  describe("British English correction", () => {
    it("corrects an added question that contains an Americanism", async () => {
      const americanQuestion = makeQuestion("What color is a healthy leaf?");
      const britishQuestion = makeQuestion("What colour is a healthy leaf?");
      const sectionAgent = jest.fn().mockResolvedValue({
        error: null,
        data: {
          version: "v3",
          questions: [americanQuestion],
          imageMetadata: [],
        },
      });
      const corrector = jest.fn().mockResolvedValue({
        error: null,
        data: {
          version: "v3",
          questions: [q1, q2, q3, britishQuestion],
          imageMetadata: [],
        },
      });
      const callbacks = makeCallbacks();

      const runtime = makeRuntime({
        plannerAgent: jest.fn().mockResolvedValue({
          error: null,
          data: {
            decision: "plan",
            parsedUserMessage: "Add a question about colour",
            plan: [
              {
                type: "section",
                sectionKey: "starterQuiz",
                action: "generate",
                sectionInstructions: null,
                itemIntent: {
                  action: "ADD_ITEM",
                  position: null,
                },
              },
            ],
          },
        }),
        sectionAgents: {
          "starterQuiz--default": {
            id: "starterQuiz--default",
            description: "starter quiz",
            handler: sectionAgent,
          },
        } as unknown as SectionAgentRegistry,
        britishEnglishCorrectorAgent: corrector,
      });

      await ailaTurn({
        persistedState: makePersistedState(),
        runtime,
        callbacks,
      });

      expect(corrector).toHaveBeenCalledTimes(1);
      expect(getUpdatedStarterQuiz(callbacks)?.questions).toEqual([
        q1,
        q2,
        q3,
        britishQuestion,
      ]);
    });
  });

  describe("REMOVE_ITEM", () => {
    it("splices the question at the given position without calling the section agent", async () => {
      const sectionAgent = jest.fn();
      const callbacks = makeCallbacks();

      const runtime = makeRuntime({
        plannerAgent: jest.fn().mockResolvedValue({
          error: null,
          data: {
            decision: "plan",
            parsedUserMessage: "Remove question 2 from the starter quiz",
            plan: [
              {
                type: "section",
                sectionKey: "starterQuiz",
                action: "generate",
                sectionInstructions: null,
                itemIntent: {
                  action: "REMOVE_ITEM",
                  position: 2,
                },
              },
            ],
          },
        }),
        sectionAgents: {
          "starterQuiz--default": {
            id: "starterQuiz--default",
            description: "starter quiz",
            handler: sectionAgent,
          },
        } as unknown as SectionAgentRegistry,
      });

      const outcome = await ailaTurn({
        persistedState: makePersistedState(),
        runtime,
        callbacks,
      });

      expect(outcome.status).toBe("success");
      expect(sectionAgent).not.toHaveBeenCalled();

      const updatedQuiz = getUpdatedStarterQuiz(callbacks);
      expect(updatedQuiz?.questions).toHaveLength(2);
      expect(updatedQuiz?.questions).toEqual([q1, q3]);
    });

    it("returns a note and leaves the quiz unchanged when position is null", async () => {
      const callbacks = makeCallbacks();

      const runtime = makeRuntime({
        plannerAgent: jest.fn().mockResolvedValue({
          error: null,
          data: {
            decision: "plan",
            parsedUserMessage: "Remove a question",
            plan: [
              {
                type: "section",
                sectionKey: "starterQuiz",
                action: "generate",
                sectionInstructions: null,
                itemIntent: {
                  action: "REMOVE_ITEM",
                  position: null,
                },
              },
            ],
          },
        }),
      });

      const outcome = await ailaTurn({
        persistedState: makePersistedState(),
        runtime,
        callbacks,
      });

      expect(outcome.status).toBe("success");

      const updatedQuiz = getUpdatedStarterQuiz(callbacks);
      expect(updatedQuiz?.questions).toHaveLength(3);
    });

    it("returns a note and leaves the quiz unchanged when position is out of range", async () => {
      const callbacks = makeCallbacks();

      const runtime = makeRuntime({
        plannerAgent: jest.fn().mockResolvedValue({
          error: null,
          data: {
            decision: "plan",
            parsedUserMessage: "Remove question 99 from the starter quiz",
            plan: [
              {
                type: "section",
                sectionKey: "starterQuiz",
                action: "generate",
                sectionInstructions: null,
                itemIntent: {
                  action: "REMOVE_ITEM",
                  position: 99,
                },
              },
            ],
          },
        }),
      });

      await ailaTurn({
        persistedState: makePersistedState(),
        runtime,
        callbacks,
      });

      const updatedQuiz = getUpdatedStarterQuiz(callbacks);
      expect(updatedQuiz?.questions).toHaveLength(3);
    });

    it("bypasses the dispatcher when itemIntent is absent", async () => {
      const sectionAgent = jest.fn().mockResolvedValue({
        error: null,
        data: {
          version: "v3",
          questions: [q1],
          imageMetadata: [],
        },
      });
      const callbacks = makeCallbacks();

      const runtime = makeRuntime({
        plannerAgent: jest.fn().mockResolvedValue({
          error: null,
          data: {
            decision: "plan",
            parsedUserMessage: "Regenerate the starter quiz",
            plan: [
              {
                type: "section",
                sectionKey: "starterQuiz",
                action: "generate",
                sectionInstructions: null,
              },
            ],
          },
        }),
        sectionAgents: {
          "starterQuiz--default": {
            id: "starterQuiz--default",
            description: "starter quiz",
            handler: sectionAgent,
          },
        } as unknown as SectionAgentRegistry,
      });

      const outcome = await ailaTurn({
        persistedState: makePersistedState(),
        runtime,
        callbacks,
      });

      expect(outcome.status).toBe("success");
      expect(sectionAgent).toHaveBeenCalledTimes(1);
    });
  });
});
