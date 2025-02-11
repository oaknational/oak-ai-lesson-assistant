import type { StoreApi } from "zustand";

import { createChatStore, type AiSdkActions, type ChatStore } from "..";

describe("handleStop", () => {
  let store: StoreApi<ChatStore>;
  let mockAiSdkActions: {
    stop: jest.Mock;
  };

  beforeEach(() => {
    mockAiSdkActions = {
      stop: jest.fn(),
    };

    store = createChatStore();
    store
      .getState()
      .setAiSdkActions(mockAiSdkActions as unknown as AiSdkActions);
  });

  afterEach(() => {
    store.getState().reset();
    jest.clearAllMocks();
  });

  test("should clear queued action if one exists", () => {
    store.setState({ queuedUserAction: "Some action" });
    store.getState().stop();

    expect(store.getState().queuedUserAction).toBeNull();
    expect(mockAiSdkActions.stop).not.toHaveBeenCalled();
  });

  test("should call aiSdkActions.stop if no queued action exists", () => {
    store.getState().stop();

    expect(mockAiSdkActions.stop).toHaveBeenCalled();
  });
});
