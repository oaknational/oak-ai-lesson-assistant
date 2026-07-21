import { ailaTurn } from "../ailaTurn";
import type {
  AilaPersistedState,
  AilaRuntimeContext,
  AilaTurnCallbacks,
  SectionAgentRegistry,
} from "../types";

const generatedPoints = [
  "The color wheel shows primary and secondary colours.",
  "Primary colours cannot be mixed from other colours.",
  "Secondary colours are made by mixing two primary colours.",
  "Complementary colours sit opposite each other on the wheel.",
];

const correctedPoints = generatedPoints.map((point) =>
  point.replace("color", "colour"),
);

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
        content: "Generate the key learning points",
      },
    ],
    initialDocument: {},
    relevantLessons: null,
    ragFetched: { status: "not_fetched", searchIdentity: null },
  };
}

function makeRuntime(
  overrides: Partial<AilaRuntimeContext> = {},
): AilaRuntimeContext {
  return {
    config: { mathsQuizEnabled: false },
    plannerAgent: jest.fn().mockResolvedValue({
      error: null,
      data: {
        decision: "plan",
        parsedUserMessage: "Generate the key learning points",
        plan: [
          {
            type: "section",
            sectionKey: "keyLearningPoints",
            action: "generate",
            sectionInstructions: null,
          },
        ],
      },
    }),
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

function getUpdatedKeyLearningPoints(
  callbacks: AilaTurnCallbacks,
): string[] | undefined {
  const call = jest.mocked(callbacks.onTurnComplete).mock.calls[0]?.[0];
  return call?.document?.keyLearningPoints;
}

describe("executePlanSteps key learning points correction", () => {
  it("corrects points that contain an Americanism", async () => {
    const sectionAgent = jest.fn().mockResolvedValue({
      error: null,
      data: generatedPoints,
    });
    const corrector = jest.fn().mockResolvedValue({
      error: null,
      data: correctedPoints,
    });
    const callbacks = makeCallbacks();

    const runtime = makeRuntime({
      sectionAgents: {
        "keyLearningPoints--default": {
          id: "keyLearningPoints--default",
          description: "key learning points",
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
    expect(getUpdatedKeyLearningPoints(callbacks)).toEqual(correctedPoints);
  });

  it("falls back to the uncorrected points when the corrector adds a fifth point", async () => {
    const sectionAgent = jest.fn().mockResolvedValue({
      error: null,
      data: generatedPoints,
    });
    const corrector = jest.fn().mockResolvedValue({
      error: null,
      data: [...correctedPoints, "An extra point the corrector invented."],
    });
    const callbacks = makeCallbacks();

    const runtime = makeRuntime({
      sectionAgents: {
        "keyLearningPoints--default": {
          id: "keyLearningPoints--default",
          description: "key learning points",
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
    expect(getUpdatedKeyLearningPoints(callbacks)).toEqual(generatedPoints);
  });
});
