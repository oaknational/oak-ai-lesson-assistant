import type { BasedOn, PartialLessonPlan } from "../../../protocol/schema";
import { createEmptyCorrectorStats } from "../correctorStats";
import type {
  AgenticRagLessonPlanResult,
  AilaExecutionContext,
  AilaRuntimeContext,
  AilaTurnCallbacks,
} from "../types";
import { handleRelevantLessons } from "./handleRelevantLessons";

function createCallbacks() {
  return {
    onPlannerComplete: jest.fn(),
    onSectionComplete: jest.fn(),
    onTurnComplete: jest.fn().mockResolvedValue(undefined),
    onTurnFailed: jest.fn().mockResolvedValue(undefined),
  } satisfies AilaTurnCallbacks;
}

function createContext({
  document,
  initialDocument,
  fetchResult = [],
}: {
  document: PartialLessonPlan;
  initialDocument: PartialLessonPlan;
  fetchResult?: AgenticRagLessonPlanResult[];
}) {
  const callbacks = createCallbacks();
  const fetchRelevantLessons = jest.fn().mockResolvedValue(fetchResult);
  const runtime = {
    config: { mathsQuizEnabled: true },
    plannerAgent: jest.fn(),
    sectionAgents: {} as AilaRuntimeContext["sectionAgents"],
    messageToUserAgent: jest.fn(),
    britishEnglishCorrectorAgent: jest.fn(),
    fetchRelevantLessons,
  } satisfies AilaRuntimeContext;

  const context: AilaExecutionContext = {
    persistedState: { messages: [], initialDocument, relevantLessons: null },
    runtime,
    currentTurn: {
      document,
      plannerOutput: null,
      errors: [],
      notes: [],
      stepsExecuted: [],
      relevantLessons: null,
      relevantLessonsFetched: false,
      currentStep: null,
      correctorStats: createEmptyCorrectorStats(),
    },
    callbacks,
  };

  return { context, callbacks, fetchRelevantLessons };
}

const staleBasedOn: BasedOn = { id: "old-1", title: "Angles in triangles" };

const lessonResult: AgenticRagLessonPlanResult = {
  ragLessonPlanId: "rag-1",
  oakLessonId: 1,
  oakLessonSlug: "angles",
  lessonPlan: { title: "Angles in triangles" },
};

describe("handleRelevantLessons", () => {
  it("fetches relevant lessons when the metadata changed despite a stale basedOn", async () => {
    const { context, fetchRelevantLessons } = createContext({
      initialDocument: {
        title: "Angles in triangles",
        subject: "maths",
        keyStage: "ks2",
        basedOn: staleBasedOn,
      },
      document: {
        title: "Angle bisectors",
        subject: "maths",
        keyStage: "ks2",
        basedOn: staleBasedOn,
      },
    });

    await handleRelevantLessons(context);

    expect(fetchRelevantLessons).toHaveBeenCalledWith({
      title: "Angle bisectors",
      subject: "maths",
      keyStage: "ks2",
    });
  });

  it("clears the stale basedOn when the metadata changed and no lessons are found", async () => {
    const { context, callbacks } = createContext({
      initialDocument: {
        title: "Angles in triangles",
        subject: "maths",
        keyStage: "ks2",
        basedOn: staleBasedOn,
      },
      document: {
        title: "Angle bisectors",
        subject: "maths",
        keyStage: "ks2",
        basedOn: staleBasedOn,
      },
      fetchResult: [],
    });

    const outcome = await handleRelevantLessons(context);

    expect(outcome).toEqual({ status: "continue" });
    expect(context.currentTurn.document.basedOn).toBeUndefined();
    expect(callbacks.onSectionComplete).toHaveBeenCalledWith([
      { op: "remove", path: "/basedOn" },
    ]);
  });

  it("keeps a basedOn that was selected during this turn without refetching", async () => {
    const { context, fetchRelevantLessons } = createContext({
      initialDocument: {
        title: "Angle bisectors",
        subject: "maths",
        keyStage: "ks2",
      },
      document: {
        title: "Angle bisectors",
        subject: "maths",
        keyStage: "ks2",
        basedOn: { id: "new-1", title: "Angle bisectors" },
      },
    });

    const outcome = await handleRelevantLessons(context);

    expect(outcome).toEqual({ status: "continue" });
    expect(fetchRelevantLessons).not.toHaveBeenCalled();
    expect(context.currentTurn.document.basedOn).toEqual({
      id: "new-1",
      title: "Angle bisectors",
    });
  });

  it("keeps an existing basedOn and does not refetch when the metadata is unchanged", async () => {
    const { context, callbacks, fetchRelevantLessons } = createContext({
      initialDocument: {
        title: "Angles in triangles",
        subject: "maths",
        keyStage: "ks2",
        basedOn: staleBasedOn,
      },
      document: {
        title: "Angles in triangles",
        subject: "maths",
        keyStage: "ks2",
        basedOn: staleBasedOn,
      },
    });

    const outcome = await handleRelevantLessons(context);

    expect(outcome).toEqual({ status: "continue" });
    expect(fetchRelevantLessons).not.toHaveBeenCalled();
    expect(context.currentTurn.document.basedOn).toEqual(staleBasedOn);
    expect(callbacks.onSectionComplete).not.toHaveBeenCalled();
  });

  it("prompts the user to pick when changed metadata returns relevant lessons", async () => {
    const { context, callbacks } = createContext({
      initialDocument: {
        title: "Angles in triangles",
        subject: "maths",
        keyStage: "ks2",
        basedOn: staleBasedOn,
      },
      document: {
        title: "Angle bisectors",
        subject: "maths",
        keyStage: "ks2",
        basedOn: staleBasedOn,
      },
      fetchResult: [lessonResult],
    });

    const outcome = await handleRelevantLessons(context);

    expect(outcome.status).toBe("success");
    expect(context.currentTurn.document.basedOn).toBeUndefined();
    expect(callbacks.onTurnComplete).toHaveBeenCalled();
  });
});
