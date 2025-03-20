import type { TrackFns } from "@/components/ContextProviders/AnalyticsProvider";

import { createLessonPlanTrackingStore } from "..";

const createArgs = {
  id: "test_id",
  getStore: jest.fn(),
  track: {} as unknown as TrackFns,
};

describe("lessonPlanTracking queueing", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("saves the user intent", () => {
    const store = createLessonPlanTrackingStore(createArgs);

    store.getState().actions.clickedContinue();

    const { currentMessage, queuedMessage } = store.getState();
    expect(currentMessage).toEqual({
      componentType: "continue_button",
      text: "",
    });
    expect(queuedMessage).toBeNull();
  });

  it("queues the intent if another message is in flight", () => {
    const store = createLessonPlanTrackingStore(createArgs);
    store.setState({
      currentMessage: {
        componentType: "continue_button",
        text: "",
      },
    });

    store.getState().actions.submittedText("test message");

    const { currentMessage, queuedMessage } = store.getState();
    expect(currentMessage).toEqual({
      componentType: "continue_button",
      text: "",
    });
    expect(queuedMessage).toEqual({
      componentType: "type_edit",
      text: "test message",
    });
  });

  it("makes the queued message current after streaming completes", () => {
    const store = createLessonPlanTrackingStore(createArgs);
    store.setState({
      currentMessage: {
        componentType: "continue_button",
        text: "",
      },
      queuedMessage: {
        componentType: "type_edit",
        text: "test message",
      },
    });

    const actions = store.getState().actions;
    createArgs.getStore.mockReturnValue({ lessonPlan: {} });
    actions.prepareForNextMessage();

    const { currentMessage, queuedMessage } = store.getState();
    expect(currentMessage).toEqual({
      componentType: "type_edit",
      text: "test message",
    });
    expect(queuedMessage).toBeNull();
  });

  it.todo("lets a queued message be cancelled");
});
