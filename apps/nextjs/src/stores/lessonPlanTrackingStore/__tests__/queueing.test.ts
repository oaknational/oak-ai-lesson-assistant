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

    const { currentMessage, queuedMessage } = store.getState();
    expect(currentMessage).toEqual({
      componentType: "continue_button",
      text: "",
    });
    expect(queuedMessage).toBeNull();
  });

  it("queues the intent if another message is in flight", () => {
    const { store, actions } = setUpStore();

    // Initial intent
    actions.clickedContinue();
    // Queued intent (while moderating)
    actions.submittedText("queued message");

    const { currentMessage, queuedMessage } = store.getState();
    expect(currentMessage).toEqual({
      componentType: "continue_button",
      text: "",
    });
    expect(queuedMessage).toEqual({
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
    // Simulate trackCompletion clearing currentMessage
    store.setState({ currentMessage: null });
    // Move queued message to current
    actions.prepareForNextMessage();

    const { currentMessage, queuedMessage } = store.getState();
    expect(currentMessage).toEqual({
      componentType: "type_edit",
      text: "queued message",
    });
    expect(queuedMessage).toBeNull();
  });

  it("clears queued message if it's cancelled", () => {
    const { store, actions } = setUpStore();

    // Initial intent
    actions.clickedContinue();
    // Queued intent (while moderating)
    actions.submittedText("queued message");
    actions.clearQueuedIntent();
    // Simulate trackCompletion clearing currentMessage
    store.setState({ currentMessage: null });
    // Move queued message to current
    actions.prepareForNextMessage();

    const { currentMessage, queuedMessage } = store.getState();
    expect(currentMessage).toBeNull();
    expect(queuedMessage).toBeNull();
  });
});
