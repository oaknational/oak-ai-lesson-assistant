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
    ragFetched?: AilaExecutionContext["persistedState"]["ragFetched"];
    fetchResult?: AgenticRagLessonPlanResult[];
  } = {},
): AilaExecutionContext {
  return {
    persistedState: {
      messages: [],
      initialDocument: {},
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

  it("prompts the user to pick when a stale basedOn is cleared and lessons are found", async () => {
    const ctx = createContext({
      document: {
        title: "Angle bisectors",
        subject: "maths",
        keyStage: "ks2",
        basedOn: staleBasedOn,
      },
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
