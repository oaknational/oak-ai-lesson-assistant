import type { StoreApi } from "zustand";

import { createChatStore, type AiSdkActions, type ChatStore } from "../index";

describe("handleAppend", () => {
  let mockAiSdkActions: {
    append: jest.Mock;
  };

  beforeEach(() => {
    mockAiSdkActions = {
      append: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should not append when canAppend is false", () => {
    const store = createChatStore({
      ailaStreamingStatus: "StreamingChatResponse",
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });

    store.getState().append("Hello");

    expect(mockAiSdkActions.append).not.toHaveBeenCalled();
  });

  test("should queue action when streaming is not idle", () => {
    const store = createChatStore({
      ailaStreamingStatus: "Moderating",
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });

    store.getState().append("Hello");

    expect(store.getState().queuedUserAction).toBe("Hello");
    expect(mockAiSdkActions.append).not.toHaveBeenCalled();
  });

  test("should append message when streaming is idle and canAppend is true", () => {
    const store = createChatStore({
      ailaStreamingStatus: "Idle",
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });

    store.getState().append("Hello");

    expect(mockAiSdkActions.append).toHaveBeenCalledWith({
      content: "Hello",
      role: "user",
    });
  });
});
