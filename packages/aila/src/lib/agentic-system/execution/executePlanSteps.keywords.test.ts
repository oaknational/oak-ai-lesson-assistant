import type { Keyword } from "../../../protocol/schema";
import { ailaTurn } from "../ailaTurn";
import type {
  AilaPersistedState,
  AilaRuntimeContext,
  AilaTurnCallbacks,
  SectionAgentRegistry,
} from "../types";

const k1: Keyword = {
  keyword: "Photosynthesis",
  definition: "How plants make food using light.",
};
const k2: Keyword = {
  keyword: "Chlorophyll",
  definition: "The green pigment that absorbs light.",
};
const k3: Keyword = {
  keyword: "Stomata",
  definition: "Pores in a leaf that let gases move in and out.",
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

function makePersistedState(
  message: string,
  keywords: Keyword[] = [k1, k2, k3],
): AilaPersistedState {
  return {
    messages: [{ id: "u1", role: "user", content: message }],
    initialDocument: { keywords },
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

function plannerEmitting(
  parsedUserMessage: string,
  itemIntent?: { action: string; position: number | null },
) {
  return jest.fn().mockResolvedValue({
    error: null,
    data: {
      decision: "plan",
      parsedUserMessage,
      plan: [
        {
          type: "section",
          sectionKey: "keywords",
          action: "generate",
          sectionInstructions: null,
          ...(itemIntent ? { itemIntent } : {}),
        },
      ],
    },
  });
}

function keywordsAgent(handler: jest.Mock): SectionAgentRegistry {
  return {
    "keywords--default": {
      id: "keywords--default",
      description: "keywords",
      handler,
    },
  } as unknown as SectionAgentRegistry;
}

function getUpdatedKeywords(
  callbacks: AilaTurnCallbacks,
): Keyword[] | undefined {
  const call = jest.mocked(callbacks.onTurnComplete).mock.calls[0]?.[0];
  return call?.document?.keywords;
}

describe("executePlanSteps — keywords dispatch intercept", () => {
  describe("REMOVE_ITEM", () => {
    it("splices the keyword at the given position without calling the section agent", async () => {
      const handler = jest.fn();
      const callbacks = makeCallbacks();
      const runtime = makeRuntime({
        plannerAgent: plannerEmitting("Remove the second keyword", {
          action: "REMOVE_ITEM",
          position: 2,
        }),
        sectionAgents: keywordsAgent(handler),
      });

      const outcome = await ailaTurn({
        persistedState: makePersistedState("Remove the second keyword"),
        runtime,
        callbacks,
      });

      expect(outcome.status).toBe("success");
      expect(handler).not.toHaveBeenCalled();
      expect(getUpdatedKeywords(callbacks)).toEqual([k1, k3]);
    });
  });

  describe("ADD_ITEM", () => {
    it("appends the new keyword and preserves the existing ones", async () => {
      const newKeyword: Keyword = {
        keyword: "Glucose",
        definition: "The sugar produced during photosynthesis.",
      };
      const handler = jest
        .fn()
        .mockResolvedValue({ error: null, data: [newKeyword] });
      const callbacks = makeCallbacks();
      const runtime = makeRuntime({
        plannerAgent: plannerEmitting("Add a keyword about glucose", {
          action: "ADD_ITEM",
          position: null,
        }),
        sectionAgents: keywordsAgent(handler),
      });

      await ailaTurn({
        persistedState: makePersistedState("Add a keyword about glucose"),
        runtime,
        callbacks,
      });

      expect(handler).toHaveBeenCalledTimes(1);
      const keywords = getUpdatedKeywords(callbacks);
      expect(keywords).toHaveLength(4);
      expect(keywords?.[3]).toEqual(newKeyword);
      expect(keywords?.[0]).toEqual(k1);
      expect(keywords?.[1]).toEqual(k2);
      expect(keywords?.[2]).toEqual(k3);
    });
  });

  describe("CHANGE_ITEM", () => {
    it("replaces the keyword at the given position and preserves its neighbours", async () => {
      const replacement: Keyword = {
        keyword: "Chlorophyll",
        definition: "The pigment that makes leaves green and traps light.",
      };
      const handler = jest
        .fn()
        .mockResolvedValue({ error: null, data: [replacement] });
      const callbacks = makeCallbacks();
      const runtime = makeRuntime({
        plannerAgent: plannerEmitting("Reword the second keyword", {
          action: "CHANGE_ITEM",
          position: 2,
        }),
        sectionAgents: keywordsAgent(handler),
      });

      await ailaTurn({
        persistedState: makePersistedState("Reword the second keyword"),
        runtime,
        callbacks,
      });

      expect(handler).toHaveBeenCalledTimes(1);
      const keywords = getUpdatedKeywords(callbacks);
      expect(keywords).toEqual([k1, replacement, k3]);
      expect(keywords?.[0]).toEqual(k1);
      expect(keywords?.[2]).toEqual(k3);
    });
  });

  describe("declined edits", () => {
    it("leaves the keywords unchanged when the position is unknown", async () => {
      const handler = jest.fn();
      const callbacks = makeCallbacks();
      const runtime = makeRuntime({
        plannerAgent: plannerEmitting("Remove a keyword", {
          action: "REMOVE_ITEM",
          position: null,
        }),
        sectionAgents: keywordsAgent(handler),
      });

      await ailaTurn({
        persistedState: makePersistedState("Remove a keyword"),
        runtime,
        callbacks,
      });

      expect(handler).not.toHaveBeenCalled();
      expect(getUpdatedKeywords(callbacks)).toEqual([k1, k2, k3]);
    });

    it("regenerates the whole section when no itemIntent is present", async () => {
      const regenerated: Keyword[] = [
        { keyword: "Respiration", definition: "How cells release energy." },
      ];
      const handler = jest
        .fn()
        .mockResolvedValue({ error: null, data: regenerated });
      const callbacks = makeCallbacks();
      const runtime = makeRuntime({
        plannerAgent: plannerEmitting("Redo the keywords"),
        sectionAgents: keywordsAgent(handler),
      });

      await ailaTurn({
        persistedState: makePersistedState("Redo the keywords"),
        runtime,
        callbacks,
      });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(getUpdatedKeywords(callbacks)).toEqual(regenerated);
    });
  });
});
