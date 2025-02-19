import { createChatStore, type AiSdkActions } from "..";

describe("handleStop", () => {
  let mockAiSdkActions: {
    stop: jest.Mock;
  };

  beforeEach(() => {
    mockAiSdkActions = {
      stop: jest.fn(),
    };
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should clear queued action if one exists", () => {
    const store = createChatStore({
      queuedUserAction: "Some action",
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });
    store.getState().stop();

    expect(store.getState().queuedUserAction).toBeNull();
    expect(mockAiSdkActions.stop).not.toHaveBeenCalled();
  });

  test("should call aiSdkActions.stop if no queued action exists", () => {
    const store = createChatStore({
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });
    store.getState().stop();

    expect(mockAiSdkActions.stop).toHaveBeenCalled();
  });
});
