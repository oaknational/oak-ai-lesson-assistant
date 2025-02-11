import type { StoreApi } from "zustand";

import { createChatStore, type AiSdkActions, type ChatStore } from "../index";

describe("handleAppend", () => {
  let store: StoreApi<ChatStore>;
  let mockAiSdkActions: {
    append: jest.Mock;
  };

  beforeEach(() => {
    mockAiSdkActions = {
      append: jest.fn(),
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

  test("should not append when canAppend is false", () => {
    store.getState().ailaStreamingStatus = "StreamingChatResponse";

    store.getState().append("Hello");

    expect(mockAiSdkActions.append).not.toHaveBeenCalled();
  });

  test("should queue action when streaming is not idle", () => {
    store.getState().ailaStreamingStatus = "Moderating";
    store.getState().append("Hello");

    expect(store.getState().queuedUserAction).toBe("Hello");
    expect(mockAiSdkActions.append).not.toHaveBeenCalled();
  });

  test("should append message when streaming is idle and canAppend is true", () => {
    store.getState().ailaStreamingStatus = "Idle";
    store.getState().append("Hello");

    expect(mockAiSdkActions.append).toHaveBeenCalledWith({
      content: "Hello",
      role: "user",
    });
  });
});
