import type { GetStore } from "@/stores/AilaStoresProvider";

import { createChatStore, type AiSdkActions } from "../index";

describe("handleAppend", () => {
  const mockAiSdkActions = {
    append: jest.fn(),
  };
  const getStore = jest.fn() as unknown as GetStore;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should not append when canAppend is false", () => {
    const store = createChatStore(getStore, {
      ailaStreamingStatus: "StreamingChatResponse",
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });

    store.getState().append("Hello");

    expect(mockAiSdkActions.append).not.toHaveBeenCalled();
  });

  test("should queue action when streaming is not idle", () => {
    const store = createChatStore(getStore, {
      ailaStreamingStatus: "Moderating",
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });

    store.getState().append("Hello");

    expect(store.getState().queuedUserAction).toBe("Hello");
    expect(mockAiSdkActions.append).not.toHaveBeenCalled();
  });

  test("should append message when streaming is idle and canAppend is true", () => {
    const store = createChatStore(getStore, {
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
