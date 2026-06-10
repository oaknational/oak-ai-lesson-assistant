// cspell:ignore trangles
import type { PartialLessonPlan } from "../../../protocol/schema";
import type {
  AgenticRagLessonPlanResult,
  AilaExecutionContext,
  AilaTurnCallbacks,
} from "../types";
import { handleRelevantLessons } from "./handleRelevantLessons";
import { terminateWithResponse } from "./termination";

jest.mock("./termination", () => ({
  terminateWithResponse: jest.fn(),
}));

function createContext(
  overrides: {
    document?: Partial<AilaExecutionContext["currentTurn"]["document"]>;
    initialDocument?: PartialLessonPlan;
    ragFetched?: AilaExecutionContext["persistedState"]["ragFetched"];
    fetchResult?: AgenticRagLessonPlanResult[];
  } = {},
): AilaExecutionContext {
  return {
    persistedState: {
      messages: [],
      initialDocument: overrides.initialDocument ?? {},
      relevantLessons: null,
      ragFetched: overrides.ragFetched ?? {
        status: "not_fetched",
        searchIdentity: null,
      },
    },
    runtime: {
      britishEnglishCorrectorAgent: jest.fn(),
      plannerAgent: jest.fn(),
      sectionAgents: {} as AilaExecutionContext["runtime"]["sectionAgents"],
      messageToUserAgent: jest.fn(),
      fetchRelevantLessons: jest
        .fn()
        .mockResolvedValue(overrides.fetchResult ?? []),
      config: { mathsQuizEnabled: false },
    },
    currentTurn: {
      document: {
        title: "Photosynthesis",
        subject: "science",
        keyStage: "key-stage-3",
        ...overrides.document,
      },
      plannerOutput: null,
      errors: [],
      notes: [],
      stepsExecuted: [],
      relevantLessons: null,
      relevantLessonsFetched: false,
      currentStep: null,
      correctorStats: {
        attempted: [],
        notNeeded: [],
        failed: [],
      },
    },
    callbacks: {
      onPlannerComplete: jest.fn(),
      onSectionComplete: jest.fn(),
      onRagFetchedChange: jest.fn().mockResolvedValue(undefined),
      onTurnComplete: jest.fn(),
      onTurnFailed: jest.fn(),
    },
  };
}

const fakeLessons: AgenticRagLessonPlanResult[] = [
  {
    ragLessonPlanId: "lp1",
    oakLessonId: 1,
    oakLessonSlug: "photosynthesis",
    lessonPlan: { title: "Photosynthesis" },
  },
];

const previousTopicIdentity = {
  title: "Angles in triangles",
  subject: "maths",
  keyStage: "ks2",
};

const staleBasedOn = { id: "old-1", title: "Angles in triangles" };

describe("handleRelevantLessons", () => {
  it("skips fetch and persists 'selected' when basedOn is set", async () => {
    const ctx = createContext({
      document: { basedOn: { id: "abc", title: "Some lesson" } },
    });

    const result = await handleRelevantLessons(ctx);

    expect(result).toEqual({ status: "continue" });
    expect(ctx.runtime.fetchRelevantLessons).not.toHaveBeenCalled();
    expect(ctx.persistedState.ragFetched.status).toBe("selected");
  });

  it("skips fetch when title is missing", async () => {
    const ctx = createContext({ document: { title: undefined } });

    const result = await handleRelevantLessons(ctx);

    expect(result).toEqual({ status: "continue" });
    expect(ctx.runtime.fetchRelevantLessons).not.toHaveBeenCalled();
  });

  it("skips fetch when identity has not changed significantly", async () => {
    const ctx = createContext({
      ragFetched: {
        status: "shown",
        searchIdentity: {
          title: "Photosynthesis",
          subject: "science",
          keyStage: "key-stage-3",
        },
      },
    });

    const result = await handleRelevantLessons(ctx);

    expect(result).toEqual({ status: "continue" });
    expect(ctx.runtime.fetchRelevantLessons).not.toHaveBeenCalled();
  });

  it("fetches and continues when no lessons found", async () => {
    const ctx = createContext({ fetchResult: [] });

    const result = await handleRelevantLessons(ctx);

    expect(result).toEqual({ status: "continue" });
    expect(ctx.runtime.fetchRelevantLessons).toHaveBeenCalled();
    expect(ctx.persistedState.ragFetched.status).toBe("none_found");
  });

  it("skips fetch when lesson is complete", async () => {
    const minimalQuiz = {
      version: "v3" as const,
      questions: [],
      imageMetadata: [],
    };
    const minimalCycle = {
      title: "Cycle",
      durationInMinutes: 15,
      explanation: {
        spokenExplanation: "Explanation",
        accompanyingSlideDetails: "Slide details",
        imagePrompt: "Image prompt",
        slideText: "Slide text",
      },
      checkForUnderstanding: [
        { question: "Q1?", answers: ["A1"], distractors: ["D1", "D2"] },
        { question: "Q2?", answers: ["A2"], distractors: ["D3", "D4"] },
      ],
      practice: "Practice",
      feedback: "Feedback",
    };
    const completedOverrides: Partial<PartialLessonPlan> = {
      learningOutcome: "I can explain photosynthesis",
      learningCycles: ["Introduce photosynthesis"],
      priorKnowledge: ["Cell biology"],
      keyLearningPoints: ["Photosynthesis uses light"],
      misconceptions: [
        {
          misconception: "Plants eat soil",
          description: "Plants make food from light",
        },
      ],
      keywords: [
        { keyword: "Photosynthesis", definition: "Process of making food" },
      ],
      basedOn: null,
      starterQuiz: minimalQuiz,
      cycle1: minimalCycle,
      cycle2: minimalCycle,
      cycle3: null,
      exitQuiz: minimalQuiz,
      additionalMaterials: null,
    };
    const ctx = createContext({ document: completedOverrides });

    const result = await handleRelevantLessons(ctx);

    expect(result).toEqual({ status: "continue" });
    expect(ctx.runtime.fetchRelevantLessons).not.toHaveBeenCalled();
  });

  it("does not call onRagFetchedChange when state is unchanged", async () => {
    const identity = {
      title: "Photosynthesis",
      subject: "science",
      keyStage: "key-stage-3",
    };
    const ctx = createContext({
      document: { basedOn: { id: "abc", title: "X" } },
      ragFetched: { status: "selected", searchIdentity: identity },
    });

    await handleRelevantLessons(ctx);

    expect(ctx.callbacks as AilaTurnCallbacks).toHaveProperty(
      "onRagFetchedChange",
    );
    expect(ctx.callbacks.onRagFetchedChange).not.toHaveBeenCalled();
  });

  it("keeps an existing basedOn when the topic is unchanged", async () => {
    const ctx = createContext({
      document: {
        title: "Angles in triangles",
        subject: "maths",
        keyStage: "ks2",
        basedOn: staleBasedOn,
      },
      initialDocument: { basedOn: staleBasedOn },
      ragFetched: {
        status: "shown",
        searchIdentity: previousTopicIdentity,
      },
    });

    const result = await handleRelevantLessons(ctx);

    expect(result).toEqual({ status: "continue" });
    expect(ctx.runtime.fetchRelevantLessons).not.toHaveBeenCalled();
    expect(ctx.currentTurn.document.basedOn).toEqual(staleBasedOn);
    expect(ctx.callbacks.onSectionComplete).not.toHaveBeenCalled();
  });

  it("clears a stale basedOn and re-fetches when the topic changed", async () => {
    const ctx = createContext({
      document: {
        title: "Angle bisectors",
        subject: "maths",
        keyStage: "ks2",
        basedOn: staleBasedOn,
      },
      initialDocument: { basedOn: staleBasedOn },
      ragFetched: { status: "selected", searchIdentity: previousTopicIdentity },
      fetchResult: [],
    });

    const result = await handleRelevantLessons(ctx);

    expect(result).toEqual({ status: "continue" });
    expect(ctx.runtime.fetchRelevantLessons).toHaveBeenCalledWith({
      title: "Angle bisectors",
      subject: "maths",
      keyStage: "ks2",
    });
    expect(ctx.currentTurn.document.basedOn).toBeUndefined();
    expect(ctx.callbacks.onSectionComplete).toHaveBeenCalledWith([
      { op: "remove", path: "/basedOn" },
    ]);
    expect(ctx.persistedState.ragFetched.status).toBe("none_found");
  });

  it("ends the turn with the lesson picker when lessons are found", async () => {
    const actual = jest.requireActual<{
      terminateWithResponse: typeof terminateWithResponse;
    }>("./termination");
    jest
      .mocked(terminateWithResponse)
      .mockImplementationOnce(actual.terminateWithResponse);
    const ctx = createContext({ fetchResult: fakeLessons });

    const result = await handleRelevantLessons(ctx);

    expect(result.status).toBe("success");
    expect(ctx.currentTurn.relevantLessonsFetched).toBe(true);
    expect(ctx.callbacks.onTurnComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        ailaMessage: expect.stringContaining("1. Photosynthesis"),
      }),
    );
  });

  it("keeps a selected basedOn when a later turn fixes a title typo", async () => {
    const selectedBasedOn = { id: "sel-1", title: "Angles in triangles" };
    const ctx = createContext({
      document: {
        title: "Angles in triangles",
        subject: "maths",
        keyStage: "ks2",
        basedOn: selectedBasedOn,
      },
      initialDocument: { basedOn: selectedBasedOn },
      ragFetched: {
        status: "selected",
        searchIdentity: {
          title: "Angles in trangles",
          subject: "maths",
          keyStage: "ks2",
        },
      },
    });

    const result = await handleRelevantLessons(ctx);

    expect(result).toEqual({ status: "continue" });
    expect(ctx.currentTurn.document.basedOn).toEqual(selectedBasedOn);
    expect(ctx.runtime.fetchRelevantLessons).not.toHaveBeenCalled();
    expect(ctx.callbacks.onSectionComplete).not.toHaveBeenCalled();
  });

  it("keeps a basedOn chosen this turn when the topic also changed", async () => {
    const freshBasedOn = { id: "new-1", title: "Angle bisectors" };
    const ctx = createContext({
      document: {
        title: "Constructing angle bisectors",
        subject: "maths",
        keyStage: "ks2",
        basedOn: freshBasedOn,
      },
      initialDocument: {},
      ragFetched: { status: "shown", searchIdentity: previousTopicIdentity },
    });

    const result = await handleRelevantLessons(ctx);

    expect(result).toEqual({ status: "continue" });
    expect(ctx.currentTurn.document.basedOn).toEqual(freshBasedOn);
    expect(ctx.runtime.fetchRelevantLessons).not.toHaveBeenCalled();
    expect(ctx.callbacks.onSectionComplete).not.toHaveBeenCalled();
    expect(ctx.persistedState.ragFetched).toEqual({
      status: "selected",
      searchIdentity: {
        title: "Constructing angle bisectors",
        subject: "maths",
        keyStage: "ks2",
      },
    });
  });

  it("prompts the user to pick when a stale basedOn is cleared and lessons are found", async () => {
    const ctx = createContext({
      document: {
        title: "Angle bisectors",
        subject: "maths",
        keyStage: "ks2",
        basedOn: staleBasedOn,
      },
      initialDocument: { basedOn: staleBasedOn },
      ragFetched: { status: "selected", searchIdentity: previousTopicIdentity },
      fetchResult: fakeLessons,
    });

    await handleRelevantLessons(ctx);

    expect(ctx.currentTurn.document.basedOn).toBeUndefined();
    expect(ctx.runtime.fetchRelevantLessons).toHaveBeenCalled();
    expect(terminateWithResponse).toHaveBeenCalledWith(ctx);
    expect(ctx.persistedState.ragFetched.status).toBe("shown");
  });
});
