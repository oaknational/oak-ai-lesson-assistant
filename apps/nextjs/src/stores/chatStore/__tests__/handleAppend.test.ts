import type { GetStore } from "@/stores/AilaStoresProvider";
import type { TrpcUtils } from "@/utils/trpc";

import { createChatStore, type AiSdkActions } from "../index";

describe("handleAppend", () => {
  const mockAiSdkActions = {
    append: jest.fn(),
  };
  const getStore = jest.fn() as unknown as GetStore;

  afterEach(() => {
    jest.clearAllMocks();
  });

  const id = "test-id";
  const trpcUtils = {} as unknown as TrpcUtils;

  test("should not append when canAppend is false", () => {
    const store = createChatStore(id, getStore, trpcUtils, {
      ailaStreamingStatus: "StreamingChatResponse",
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });

    store.getState().actions.append("Hello");

    expect(mockAiSdkActions.append).not.toHaveBeenCalled();
  });

  test("should queue action when streaming is not idle", () => {
    const store = createChatStore(id, getStore, trpcUtils, {
      ailaStreamingStatus: "Moderating",
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });

    store.getState().actions.append("Hello");

    expect(store.getState().queuedUserAction).toBe("Hello");
    expect(mockAiSdkActions.append).not.toHaveBeenCalled();
  });

  test("should append message when streaming is idle and canAppend is true", () => {
    const store = createChatStore(id, getStore, trpcUtils, {
      ailaStreamingStatus: "Idle",
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });

    store.getState().actions.append("Hello");

    expect(mockAiSdkActions.append).toHaveBeenCalledWith({
      content: "Hello",
      role: "user",
    });
  });
});
