import type { TrpcUtils } from "@/utils/trpc";

import { createChatStore, type AiSdkActions } from "../index";

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

  const id = "test-id";
  const trpcUtils = {} as unknown as TrpcUtils;

  test("should not append when canAppend is false", () => {
    const store = createChatStore(id, trpcUtils, {
      ailaStreamingStatus: "StreamingChatResponse",
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });

    store.getState().append("Hello");

    expect(mockAiSdkActions.append).not.toHaveBeenCalled();
  });

  test("should queue action when streaming is not idle", () => {
    const store = createChatStore(id, trpcUtils, {
      ailaStreamingStatus: "Moderating",
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });

    store.getState().append("Hello");

    expect(store.getState().queuedUserAction).toBe("Hello");
    expect(mockAiSdkActions.append).not.toHaveBeenCalled();
  });

  test("should append message when streaming is idle and canAppend is true", () => {
    const store = createChatStore(id, trpcUtils, {
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
