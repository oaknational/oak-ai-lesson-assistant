import type { Misconception } from "../../../protocol/schema";
import { ailaTurn } from "../ailaTurn";
import type {
  AilaPersistedState,
  AilaRuntimeContext,
  AilaTurnCallbacks,
  SectionAgentRegistry,
} from "../types";

const m1: Misconception = {
  misconception: "Plants get their food from the soil",
  description: "Plants make food by photosynthesis, not from the soil.",
};
const m2: Misconception = {
  misconception: "Heavier objects always fall faster",
  description: "In a vacuum all objects fall at the same rate.",
};
const m3: Misconception = {
  misconception: "The Sun orbits the Earth",
  description: "The Earth orbits the Sun once a year.",
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
  misconceptions: Misconception[],
): AilaPersistedState {
  return {
    messages: [{ id: "u1", role: "user", content: message }],
    initialDocument: { misconceptions },
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
          sectionKey: "misconceptions",
          action: "generate",
          sectionInstructions: null,
          ...(itemIntent ? { itemIntent } : {}),
        },
      ],
    },
  });
}

function misconceptionsAgent(handler: jest.Mock): SectionAgentRegistry {
  return {
    "misconceptions--default": {
      id: "misconceptions--default",
      description: "misconceptions",
      handler,
    },
  } as unknown as SectionAgentRegistry;
}

function getUpdatedMisconceptions(
  callbacks: AilaTurnCallbacks,
): Misconception[] | undefined {
  const call = jest.mocked(callbacks.onTurnComplete).mock.calls[0]?.[0];
  return call?.document?.misconceptions;
}

describe("executePlanSteps — misconceptions dispatch intercept", () => {
  describe("REMOVE_ITEM", () => {
    it("splices the misconception at the given position without calling the section agent", async () => {
      const handler = jest.fn();
      const callbacks = makeCallbacks();
      const runtime = makeRuntime({
        plannerAgent: plannerEmitting("Remove the second misconception", {
          action: "REMOVE_ITEM",
          position: 2,
        }),
        sectionAgents: misconceptionsAgent(handler),
      });

      const outcome = await ailaTurn({
        persistedState: makePersistedState("Remove the second misconception", [
          m1,
          m2,
          m3,
        ]),
        runtime,
        callbacks,
      });

      expect(outcome.status).toBe("success");
      expect(handler).not.toHaveBeenCalled();
      expect(getUpdatedMisconceptions(callbacks)).toEqual([m1, m3]);
    });
  });

  describe("ADD_ITEM", () => {
    it("appends the new misconception and preserves the existing ones", async () => {
      const newMisconception: Misconception = {
        misconception: "Cold is a thing that flows into a room",
        description: "Cold is the absence of heat; heat flows out, not in.",
      };
      const handler = jest
        .fn()
        .mockResolvedValue({ error: null, data: [newMisconception] });
      const callbacks = makeCallbacks();
      const runtime = makeRuntime({
        plannerAgent: plannerEmitting("Add a misconception about heat", {
          action: "ADD_ITEM",
          position: null,
        }),
        sectionAgents: misconceptionsAgent(handler),
      });

      await ailaTurn({
        persistedState: makePersistedState("Add a misconception about heat", [
          m1,
          m2,
        ]),
        runtime,
        callbacks,
      });

      expect(handler).toHaveBeenCalledTimes(1);
      const misconceptions = getUpdatedMisconceptions(callbacks);
      expect(misconceptions).toHaveLength(3);
      expect(misconceptions?.[2]).toEqual(newMisconception);
      expect(misconceptions?.[0]).toEqual(m1);
      expect(misconceptions?.[1]).toEqual(m2);
    });
  });

  describe("CHANGE_ITEM", () => {
    it("replaces the misconception at the given position and preserves its neighbours", async () => {
      const replacement: Misconception = {
        misconception: "Mass and weight are the same thing",
        description: "Mass is the amount of matter; weight is the force on it.",
      };
      const handler = jest
        .fn()
        .mockResolvedValue({ error: null, data: [replacement] });
      const callbacks = makeCallbacks();
      const runtime = makeRuntime({
        plannerAgent: plannerEmitting("Reword the second misconception", {
          action: "CHANGE_ITEM",
          position: 2,
        }),
        sectionAgents: misconceptionsAgent(handler),
      });

      await ailaTurn({
        persistedState: makePersistedState("Reword the second misconception", [
          m1,
          m2,
          m3,
        ]),
        runtime,
        callbacks,
      });

      expect(handler).toHaveBeenCalledTimes(1);
      const misconceptions = getUpdatedMisconceptions(callbacks);
      expect(misconceptions).toEqual([m1, replacement, m3]);
      expect(misconceptions?.[0]).toEqual(m1);
      expect(misconceptions?.[2]).toEqual(m3);
    });
  });

  describe("REGENERATE_SECTION", () => {
    const regenerated: Misconception[] = [
      {
        misconception: "Electricity is used up by components",
        description: "Current is the same all around a series circuit.",
      },
    ];

    it("calls the section agent and replaces the misconceptions when itemIntent action is REGENERATE_SECTION", async () => {
      const handler = jest
        .fn()
        .mockResolvedValue({ error: null, data: regenerated });
      const callbacks = makeCallbacks();
      const runtime = makeRuntime({
        plannerAgent: plannerEmitting("Redo the misconceptions", {
          action: "REGENERATE_SECTION",
          position: null,
        }),
        sectionAgents: misconceptionsAgent(handler),
      });

      await ailaTurn({
        persistedState: makePersistedState("Redo the misconceptions", [
          m1,
          m2,
          m3,
        ]),
        runtime,
        callbacks,
      });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(getUpdatedMisconceptions(callbacks)).toEqual(regenerated);
    });

    it("regenerates the whole section when no itemIntent is present", async () => {
      const handler = jest
        .fn()
        .mockResolvedValue({ error: null, data: regenerated });
      const callbacks = makeCallbacks();
      const runtime = makeRuntime({
        plannerAgent: plannerEmitting("Redo the misconceptions"),
        sectionAgents: misconceptionsAgent(handler),
      });

      await ailaTurn({
        persistedState: makePersistedState("Redo the misconceptions", [
          m1,
          m2,
          m3,
        ]),
        runtime,
        callbacks,
      });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(getUpdatedMisconceptions(callbacks)).toEqual(regenerated);
    });
  });
});
