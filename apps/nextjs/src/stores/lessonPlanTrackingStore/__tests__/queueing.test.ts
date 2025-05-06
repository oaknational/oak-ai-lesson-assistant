import type { TrackFns } from "@/components/ContextProviders/AnalyticsProvider";

import { createLessonPlanTrackingStore } from "..";

const createArgs = {
  id: "test_id",
  getStore: jest.fn(),
  track: {} as unknown as TrackFns,
};

const setUpStore = () => {
  const store = createLessonPlanTrackingStore(createArgs);
  createArgs.getStore.mockReturnValue({ lessonPlan: {} });
  const actions = store.getState().actions;
  return {
    store,
    actions,
  };
};

describe("lessonPlanTracking queueing", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("saves the user intent", () => {
    const { store, actions } = setUpStore();

    actions.clickedContinue();

    const { currentIntent, queuedIntent } = store.getState();
    expect(currentIntent).toEqual({
      componentType: "continue_button",
      text: "",
    });
    expect(queuedIntent).toBeNull();
  });

  it("queues the intent if another message is in flight", () => {
    const { store, actions } = setUpStore();

    // Initial intent
    actions.clickedContinue();
    // Queued intent (while moderating)
    actions.submittedText("queued message");

    const { currentIntent, queuedIntent } = store.getState();
    expect(currentIntent).toEqual({
      componentType: "continue_button",
      text: "",
    });
    expect(queuedIntent).toEqual({
      componentType: "type_edit",
      text: "queued message",
    });
  });

  it("makes the queued message current after streaming completes", () => {
    const { store, actions } = setUpStore();

    // Initial intent
    actions.clickedContinue();
    // Queued intent (while moderating)
    actions.submittedText("queued message");
    // Simulate trackCompletion clearing currentIntent
    store.setState({ currentIntent: null });
    // Move queued message to current
    actions.popQueuedIntent();

    const { currentIntent, queuedIntent } = store.getState();
    expect(currentIntent).toEqual({
      componentType: "type_edit",
      text: "queued message",
    });
    expect(queuedIntent).toBeNull();
  });

  it("clears queued message if it's cancelled", () => {
    const { store, actions } = setUpStore();

    // Initial intent
    actions.clickedContinue();
    // Queued intent (while moderating)
    actions.submittedText("queued message");
    actions.clearQueuedIntent();
    // Simulate trackCompletion clearing currentIntent
    store.setState({ currentIntent: null });
    // Move queued message to current
    actions.popQueuedIntent();

    const { currentIntent, queuedIntent } = store.getState();
    expect(currentIntent).toBeNull();
    expect(queuedIntent).toBeNull();
  });
});
