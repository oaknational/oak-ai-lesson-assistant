import type { GetStore } from "@/stores/AilaStoresProvider";
import type { TrpcUtils } from "@/utils/trpc";

import { createChatStore, type AiSdkActions } from "..";

describe("Chat Store executeQueuedAction", () => {
  const mockAiSdkActions = {
    append: jest.fn(),
    reload: jest.fn(),
  };
  const getStore = jest.fn() as unknown as GetStore;

  afterEach(() => {
    jest.clearAllMocks();
  });

  const id = "test-id";
  const trpcUtils = {} as unknown as TrpcUtils;

  test("should do nothing if there is no queued action", () => {
    const store = createChatStore(id, getStore, trpcUtils, {
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });
    const initialState = store.getState();

    store.getState().actions.executeQueuedAction();

    const newState = store.getState();

    expect(mockAiSdkActions.append).not.toHaveBeenCalled();
    expect(mockAiSdkActions.reload).not.toHaveBeenCalled();
    expect(store.getState().queuedUserAction).toBeNull();
    expect(newState.stableMessages).toBe(initialState.stableMessages);
  });

  test('should handle "continue" action correctly', () => {
    const store = createChatStore(id, getStore, trpcUtils, {
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });
    const initialState = store.getState();
    store.setState({ queuedUserAction: "continue" });

    store.getState().actions.executeQueuedAction();

    const newState = store.getState();
    expect(store.getState().queuedUserAction).toBeNull();
    expect(mockAiSdkActions.append).toHaveBeenCalledWith({
      content: "Continue",
      role: "user",
    });
    expect(newState.stableMessages).toBe(initialState.stableMessages);
  });

  test('should handle "regenerate" action correctly', () => {
    const store = createChatStore(id, getStore, trpcUtils, {
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });
    const initialState = store.getState();
    store.setState({ queuedUserAction: "regenerate" });

    store.getState().actions.executeQueuedAction();

    const newState = store.getState();
    expect(store.getState().queuedUserAction).toBeNull();
    expect(mockAiSdkActions.reload).toHaveBeenCalled();
    expect(newState.stableMessages).toBe(initialState.stableMessages);
  });

  test("should handle user message actions correctly", () => {
    const store = createChatStore(id, getStore, trpcUtils, {
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });
    const initialState = store.getState();
    const customMessage = "Hello, world!";
    store.setState({ queuedUserAction: customMessage });

    store.getState().actions.executeQueuedAction();

    const newState = store.getState();
    expect(store.getState().queuedUserAction).toBeNull();
    expect(mockAiSdkActions.append).toHaveBeenCalledWith({
      content: customMessage,
      role: "user",
    });
    expect(newState.stableMessages).toBe(initialState.stableMessages);
  });

  test("should maintain correct state after multiple actions", () => {
    const store = createChatStore(id, getStore, trpcUtils, {
      aiSdkActions: mockAiSdkActions as unknown as AiSdkActions,
    });
    const initialState = store.getState();
    store.setState({ queuedUserAction: "continue" });
    store.getState().actions.executeQueuedAction();
    expect(store.getState().queuedUserAction).toBeNull();
    expect(mockAiSdkActions.append).toHaveBeenCalledWith({
      content: "Continue",
      role: "user",
    });

    store.setState({ queuedUserAction: "regenerate" });
    store.getState().actions.executeQueuedAction();
    const newState = store.getState();
    expect(store.getState().queuedUserAction).toBeNull();
    expect(mockAiSdkActions.reload).toHaveBeenCalled();
    expect(newState.stableMessages).toBe(initialState.stableMessages);
  });
});
