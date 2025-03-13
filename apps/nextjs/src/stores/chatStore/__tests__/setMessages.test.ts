import type { GetStore } from "@/stores/AilaStoresProvider";
import type { TrpcUtils } from "@/utils/trpc";

import { type ChatState, createChatStore } from "..";
import type { AiMessage } from "../types";
import { createMessageStates } from "./messageStates";

const fixedDate = new Date("2023-01-01T12:00:00.000Z");

const messageStates = createMessageStates(fixedDate);

const executeQueuedAction = jest.fn();

const id = "test-id";
const trpcUtils = {} as unknown as TrpcUtils;

const setupStore = (initialValues?: Partial<ChatState>) => {
  const getStore = jest.fn().mockReturnValue({
    fetchModerations: jest.fn().mockResolvedValue({}),
  }) as unknown as GetStore;
  return createChatStore(id, getStore, trpcUtils, initialValues);
};

describe("Chat Store setMessages", () => {
  test("When there no messages, loading true throw error", () => {
    const store = setupStore();

    expect(() => {
      store.getState().actions.setMessages([], true);
    }).toThrow();
  });

  test("expected state when there no messages, loading false", () => {
    const store = setupStore();
    const initialState = store.getState();
    store.getState().actions.setMessages([], false);
    const newState = store.getState();

    expect(newState.streamingMessage).toBe(null);
    expect(newState.stableMessages).toBe(initialState.stableMessages);
    expect(newState.ailaStreamingStatus).toBe("Idle");
    expect(newState.aiSdkActions).toBe(initialState.aiSdkActions);
    expect(executeQueuedAction).not.toHaveBeenCalled();
  });

  test("state when streaming, no stable messages, loading true", () => {
    const store = setupStore();
    const initialState = store.getState();

    store
      .getState()
      .actions.setMessages(messageStates.streamingMessage as AiMessage[], true);

    const newState = store.getState();

    expect(newState.streamingMessage?.parts).toHaveLength(4);
    expect(newState.streamingMessage?.parts[3]?.isPartial).toBe(true);
    expect(newState.stableMessages).toBe(initialState.stableMessages);
    expect(newState.ailaStreamingStatus).toBe("StreamingLessonPlan");
  });

  test("state when streaming and stable messages, loading true", () => {
    const store = setupStore();
    const initialState = store.getState();

    store
      .getState()
      .actions.setMessages(
        messageStates.stableAndStreaming as AiMessage[],
        true,
      );

    const newState = store.getState();

    expect(newState.streamingMessage?.parts).toHaveLength(2);
    expect(newState.streamingMessage?.parts[1]?.isPartial).toBe(true);
    expect(newState.stableMessages).toHaveLength(3);
    expect(newState.stableMessages).not.toBe(initialState.stableMessages);
    expect(newState.ailaStreamingStatus).toBe("StreamingLessonPlan");
  });

  test("state when there are next stable messages, loading true", () => {
    const store = setupStore();
    store
      .getState()
      .actions.setMessages(messageStates.stableMessages as AiMessage[], true);

    const newState = store.getState();
    expect(newState.stableMessages.length).toBe(
      (messageStates.stableMessages?.length ?? 0) - 1,
    );

    expect(newState.ailaStreamingStatus).toBe("Moderating");
  });

  test("When there is a next stable message, no streaming, loading false", () => {
    const store = setupStore();
    store
      .getState()
      .actions.setMessages(messageStates.userRequest as AiMessage[], false);

    const newState = store.getState();

    expect(newState.streamingMessage).toBe(null);
    expect(newState.stableMessages).toEqual([
      {
        content:
          "Create a lesson plan about the end of Roman Britain for key stage 3 history",
        role: "user",
        id: "u-xE6aXHnAeBTzFTu8",
        createdAt: fixedDate,
        parts: [
          {
            type: "message-part",
            document: {
              type: "text",
              value:
                "Create a lesson plan about the end of Roman Britain for key stage 3 history",
            },
            id: "0",
            isPartial: false,
          },
        ],
        hasError: false,
        isEditing: false,
      },
    ]);

    expect(newState.ailaStreamingStatus).toBe("Idle");
  });

  test("Streaming message correctly marked as partial", () => {
    const store = setupStore();
    store
      .getState()
      .actions.setMessages(messageStates.streamingMessage as AiMessage[], true);

    const newState = store.getState();
    expect(newState.streamingMessage?.parts).toBeDefined();
    expect(
      newState.streamingMessage?.parts.some((part) => part.isPartial),
    ).toBe(true);
  });

  test("stableMessages do not update when getNextStableMessages returns null", () => {
    const store = setupStore();
    store
      .getState()
      .actions.setMessages(messageStates.stableMessages as AiMessage[], true);

    const initialState = store.getState();

    store
      .getState()
      .actions.setMessages(messageStates.stableMessages as AiMessage[], true);

    const newState = store.getState();

    expect(newState.stableMessages).toBe(initialState.stableMessages); // Same reference
    expect(newState.ailaStreamingStatus).toBe("Moderating");
  });

  test("No unnecessary re-renders when stableMessages stay the same", () => {
    const store = setupStore();
    const renderSpy = jest.fn();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    store.subscribe((state) => renderSpy(state.stableMessages));
    store
      .getState()
      .actions.setMessages(messageStates.stableMessages as AiMessage[], true);
    const initialState = store.getState();
    store
      .getState()
      .actions.setMessages(messageStates.stableMessages as AiMessage[], true);
    const newState = store.getState();
    expect(renderSpy).toHaveBeenCalledTimes(2);
    expect(newState.stableMessages).toBe(initialState.stableMessages);
  });

  test("ailaStreamingStatus updates correctly based on messages", () => {
    const store = setupStore();
    store
      .getState()
      .actions.setMessages(messageStates.stableMessages as AiMessage[], true);
    expect(store.getState().ailaStreamingStatus).toBe("Moderating");

    store
      .getState()
      .actions.setMessages(messageStates.userRequest as AiMessage[], false);
    expect(store.getState().ailaStreamingStatus).toBe("Idle");
  });
});
