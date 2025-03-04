import type { GetStore } from "@/stores/AilaStoresProvider";
import type { TrpcUtils } from "@/utils/trpc";

import { createChatStore, type AiSdkActions } from "..";

describe("handleStop", () => {
  const mockAiSdkActions = {
    stop: jest.fn(),
  };
  const getStore = jest.fn() as unknown as GetStore;

  afterEach(() => {
    jest.clearAllMocks();
  });

  const id = "test-id";
  const trpcUtils = {} as unknown as TrpcUtils;

  test("should clear queued action if one exists", () => {
    const store = createChatStore(id, getStore, trpcUtils, {
      queuedUserAction: "Some action",
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });
    store.getState().stop();

    expect(store.getState().queuedUserAction).toBeNull();
    expect(mockAiSdkActions.stop).not.toHaveBeenCalled();
  });

  test("should call aiSdkActions.stop if no queued action exists", () => {
    const store = createChatStore(id, getStore, trpcUtils, {
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });
    store.getState().stop();

    expect(mockAiSdkActions.stop).toHaveBeenCalled();
  });
});
