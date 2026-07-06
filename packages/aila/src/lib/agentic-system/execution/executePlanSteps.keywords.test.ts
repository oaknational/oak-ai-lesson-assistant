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

  describe("REGENERATE_SECTION", () => {
    it("calls the section agent and replaces the keywords when itemIntent action is REGENERATE_SECTION", async () => {
      const regenerated: Keyword[] = [
        { keyword: "Respiration", definition: "How cells release energy." },
      ];
      const handler = jest
        .fn()
        .mockResolvedValue({ error: null, data: regenerated });
      const callbacks = makeCallbacks();
      const runtime = makeRuntime({
        plannerAgent: plannerEmitting("Redo the keywords", {
          action: "REGENERATE_SECTION",
          position: null,
        }),
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

    it("declines when the section agent returns more than one item", async () => {
      const extras: Keyword[] = [
        { keyword: "Glucose", definition: "A simple sugar." },
        { keyword: "Starch", definition: "A storage carbohydrate." },
      ];
      const handler = jest
        .fn()
        .mockResolvedValue({ error: null, data: extras });
      const callbacks = makeCallbacks();
      const runtime = makeRuntime({
        plannerAgent: plannerEmitting("Add a keyword about sugars", {
          action: "ADD_ITEM",
          position: null,
        }),
        sectionAgents: keywordsAgent(handler),
      });

      await ailaTurn({
        persistedState: makePersistedState("Add a keyword about sugars"),
        runtime,
        callbacks,
      });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(getUpdatedKeywords(callbacks)).toEqual([k1, k2, k3]);
    });

    it("leaves an absent section absent instead of writing an empty list", async () => {
      const handler = jest.fn();
      const callbacks = makeCallbacks();
      const runtime = makeRuntime({
        plannerAgent: plannerEmitting("Remove the second keyword", {
          action: "REMOVE_ITEM",
          position: 2,
        }),
        sectionAgents: keywordsAgent(handler),
      });

      await ailaTurn({
        persistedState: {
          messages: [
            { id: "u1", role: "user", content: "Remove the second keyword" },
          ],
          initialDocument: {},
          relevantLessons: null,
          ragFetched: { status: "not_fetched", searchIdentity: null },
        },
        runtime,
        callbacks,
      });

      expect(handler).not.toHaveBeenCalled();
      expect(getUpdatedKeywords(callbacks)).toBeUndefined();
    });
  });

  describe("British English correction", () => {
    it("corrects an added keyword that contains an Americanism", async () => {
      const americanKeyword: Keyword = {
        keyword: "Color pigment",
        definition: "A substance that gives color to a leaf.",
      };
      const britishKeyword: Keyword = {
        keyword: "Colour pigment",
        definition: "A substance that gives colour to a leaf.",
      };
      const handler = jest
        .fn()
        .mockResolvedValue({ error: null, data: [americanKeyword] });
      let correctedContent: unknown;
      const corrector = jest.fn().mockImplementation((props: unknown) => {
        correctedContent = (props as { content: unknown }).content;
        return Promise.resolve({ error: null, data: [britishKeyword] });
      });
      const callbacks = makeCallbacks();
      const runtime = makeRuntime({
        plannerAgent: plannerEmitting("Add a keyword about colour", {
          action: "ADD_ITEM",
          position: null,
        }),
        sectionAgents: keywordsAgent(handler),
        britishEnglishCorrectorAgent: corrector,
      });

      await ailaTurn({
        persistedState: makePersistedState("Add a keyword about colour"),
        runtime,
        callbacks,
      });

      expect(corrector).toHaveBeenCalledTimes(1);
      // only the new item reaches the corrector, never the existing keywords
      expect(correctedContent).toEqual([americanKeyword]);
      expect(getUpdatedKeywords(callbacks)).toEqual([
        k1,
        k2,
        k3,
        britishKeyword,
      ]);
    });

    it("leaves existing items untouched when the added one is clean", async () => {
      // An existing keyword carries an Americanism; the added one is clean.
      // Per-item correction must not scan or rewrite the existing keyword.
      const existingWithAmericanism: Keyword = {
        keyword: "Color theory",
        definition: "How colour choices work together.",
      };
      const newKeyword: Keyword = {
        keyword: "Glucose",
        definition: "A simple sugar made during photosynthesis.",
      };
      const handler = jest
        .fn()
        .mockResolvedValue({ error: null, data: [newKeyword] });
      const corrector = jest.fn();
      const callbacks = makeCallbacks();
      const runtime = makeRuntime({
        plannerAgent: plannerEmitting("Add a keyword about glucose", {
          action: "ADD_ITEM",
          position: null,
        }),
        sectionAgents: keywordsAgent(handler),
        britishEnglishCorrectorAgent: corrector,
      });

      await ailaTurn({
        persistedState: makePersistedState("Add a keyword about glucose", [
          k1,
          existingWithAmericanism,
        ]),
        runtime,
        callbacks,
      });

      expect(corrector).not.toHaveBeenCalled();
      expect(getUpdatedKeywords(callbacks)).toEqual([
        k1,
        existingWithAmericanism,
        newKeyword,
      ]);
    });

    it("skips correction on a declined edit so untouched items pass through", async () => {
      const americanKeyword: Keyword = {
        keyword: "Color wheel",
        definition: "A chart of colors.",
      };
      const handler = jest.fn();
      const corrector = jest.fn();
      const callbacks = makeCallbacks();
      const runtime = makeRuntime({
        plannerAgent: plannerEmitting("Remove a keyword", {
          action: "REMOVE_ITEM",
          position: null,
        }),
        sectionAgents: keywordsAgent(handler),
        britishEnglishCorrectorAgent: corrector,
      });

      await ailaTurn({
        persistedState: makePersistedState("Remove a keyword", [
          k1,
          k2,
          americanKeyword,
        ]),
        runtime,
        callbacks,
      });

      expect(corrector).not.toHaveBeenCalled();
      expect(getUpdatedKeywords(callbacks)).toEqual([k1, k2, americanKeyword]);
    });
  });
});
