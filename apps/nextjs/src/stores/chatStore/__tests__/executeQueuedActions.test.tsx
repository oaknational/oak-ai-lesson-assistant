import type { StoreApi } from "zustand";

import { createChatStore, type AiSdkActions, type ChatStore } from ".";

describe("Chat Store executeQueuedAction", () => {
  let store: StoreApi<ChatStore>;
  let mockAiSdkActions: {
    append: jest.Mock;
    reload: jest.Mock;
  };

  beforeEach(() => {
    mockAiSdkActions = {
      append: jest.fn(),
      reload: jest.fn(),
    };

    store = createChatStore();
    // Set up AI SDK actions
    store
      .getState()
      .setAiSdkActions(mockAiSdkActions as unknown as AiSdkActions);
  });

  afterEach(() => {
    store.getState().reset();
    jest.clearAllMocks();
  });

  test("should do nothing if there is no queued action", () => {
    const initialState = store.getState();
    // Initial state has no queued action
    store.getState().executeQueuedAction();

    const newState = store.getState();

    expect(mockAiSdkActions.append).not.toHaveBeenCalled();
    expect(mockAiSdkActions.reload).not.toHaveBeenCalled();
    expect(store.getState().queuedUserAction).toBeNull();
    expect(newState.stableMessages).toBe(initialState.stableMessages);
  });

  test('should handle "continue" action correctly', () => {
    // Set up the queued action
    const initialState = store.getState();
    store.setState({ queuedUserAction: "continue" });

    store.getState().executeQueuedAction();

    const newState = store.getState();
    expect(store.getState().queuedUserAction).toBeNull();
    expect(mockAiSdkActions.append).toHaveBeenCalledWith({
      content: "Continue",
      role: "user",
    });
    expect(newState.stableMessages).toBe(initialState.stableMessages);
  });

  test('should handle "regenerate" action correctly', () => {
    // Set up the queued action
    const initialState = store.getState();
    store.setState({ queuedUserAction: "regenerate" });

    store.getState().executeQueuedAction();

    const newState = store.getState();
    expect(store.getState().queuedUserAction).toBeNull();
    expect(mockAiSdkActions.reload).toHaveBeenCalled();
    expect(newState.stableMessages).toBe(initialState.stableMessages);
  });

  test("should handle user message actions correctly", () => {
    const initialState = store.getState();
    const customMessage = "Hello, world!";
    store.setState({ queuedUserAction: customMessage });

    store.getState().executeQueuedAction();

    const newState = store.getState();
    expect(store.getState().queuedUserAction).toBeNull();
    expect(mockAiSdkActions.append).toHaveBeenCalledWith({
      content: customMessage,
      role: "user",
    });
    expect(newState.stableMessages).toBe(initialState.stableMessages);
  });

  test("should maintain correct state after multiple actions", () => {
    const initialState = store.getState();
    store.setState({ queuedUserAction: "continue" });
    store.getState().executeQueuedAction();
    expect(store.getState().queuedUserAction).toBeNull();
    expect(mockAiSdkActions.append).toHaveBeenCalledWith({
      content: "Continue",
      role: "user",
    });

    store.setState({ queuedUserAction: "regenerate" });
    store.getState().executeQueuedAction();
    const newState = store.getState();
    expect(store.getState().queuedUserAction).toBeNull();
    expect(mockAiSdkActions.reload).toHaveBeenCalled();
    expect(newState.stableMessages).toBe(initialState.stableMessages);
  });
});
