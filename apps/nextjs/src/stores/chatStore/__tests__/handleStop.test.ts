import type { GetStore } from "@/stores/AilaStoresProvider";

import { createChatStore, type AiSdkActions } from "..";

describe("handleStop", () => {
  const mockAiSdkActions = {
    stop: jest.fn(),
  };
  const getStore = jest.fn() as unknown as GetStore;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should clear queued action if one exists", () => {
    const store = createChatStore(getStore, {
      queuedUserAction: "Some action",
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });
    store.getState().stop();

    expect(store.getState().queuedUserAction).toBeNull();
    expect(mockAiSdkActions.stop).not.toHaveBeenCalled();
  });

  test("should call aiSdkActions.stop if no queued action exists", () => {
    const store = createChatStore(getStore, {
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });
    store.getState().stop();

    expect(mockAiSdkActions.stop).toHaveBeenCalled();
  });
});
