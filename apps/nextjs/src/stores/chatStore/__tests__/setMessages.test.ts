import { createModerationStore } from "@/stores/moderationStore";
import type { TrpcUtils } from "@/utils/trpc";

import { createChatStore, type ChatStore } from "..";
import type { AiMessage } from "../types";

const fixedDate = new Date("2023-01-01T12:00:00.000Z");

const executeQueuedAction = jest.fn();

const messageStates: { [key: string]: AiMessage[] } = {
  userRequest: [
    {
      content:
        "Create a lesson plan about the end of Roman Britain for key stage 3 history",
      role: "user",
      id: "u-xE6aXHnAeBTzFTu8",
      createdAt: fixedDate,
    },
  ],
  stableMessages: [
    {
      content:
        "Create a lesson plan about the end of Roman Britain for key stage 3 history",
      role: "user",
      id: "u-ROEdSl4mxvurLJqg",
      createdAt: fixedDate,
    },
    {
      id: "a-G7_z8CnQIGUjdFEk",
      role: "assistant",
      content:
        '\n␞\n{"type":"patch","reasoning":"generated","value":{"op":"add","path":"/title","value":"The end of Roman Britain"},"status":"complete"}\n␞\n\n␞\n{"type":"patch","reasoning":"generated","value":{"op":"add","path":"/subject","value":"history"},"status":"complete"}\n␞\n\n␞\n{"type":"patch","reasoning":"generated","value":{"op":"add","path":"/keyStage","value":"key-stage-3"},"status":"complete"}\n␞\n\n␞\n{"type":"comment","value":"CHAT_START"}\n␞\n{"type":"llmMessage","sectionsToEdit":[],"patches":[],"sectionsEdited":[],"prompt":{"type":"text","value":"These Oak lessons might be relevant:\\n1. The End of Roman Britain\\n2. Anglo-Saxon Society and the Dark Ages\\n3. The Anglo-Saxon Kingdoms\\n4. The arrival of the Anglo-Saxons\\n5. The return of towns in Anglo-Saxon Britain\\n\\nTo base your lesson on one of these existing Oak lessons, type the lesson number. Tap **Continue** to start from scratch."},"status":"complete"}\n␞\n{"type":"id","value":"a-G7_z8CnQIGUjdFEk"}\n␞\n\n␞\n{"type":"comment","value":"MODERATION_START"}\n␞\n\n␞\n{"type":"comment","value":"MODERATING"}\n␞\n\n␞\n{"type":"moderation","categories":[],"id":"cm6uzvfh1000nn41l37dl414n"}\n␞\n\n␞\n{"type":"comment","value":"CHAT_COMPLETE"}\n␞\n',
      createdAt: fixedDate,
    },
    {
      content: "continue",
      role: "user",
      id: "u-U53lt6NJM6Pqjz4L",
      createdAt: fixedDate,
    },
    {
      id: "a-MA06spVOqZu1-MaD",
      role: "assistant",
      content:
        '\n␞\n{"type":"comment","value":"CHAT_START"}\n␞\n{"type":"llmMessage","sectionsToEdit":[],"patches":[{"type":"patch","reasoning":"Setting the learning outcome to establish the focus of the lesson by detailing the impact of the Roman Empire\'s departure from Britain.","value":{"type":"string","op":"add","path":"/learningOutcome","value":"I can describe the impact of the Roman Empire\'s departure from Britain."},"status":"complete"}],"sectionsEdited":["learningOutcome"],"prompt":{"type":"text","value":"Is the learning outcome appropriate for your pupils? If not, suggest an edit. Otherwise, tap **Continue** to move on to the next step."},"status":"complete"}\n␞\n{"type":"id","value":"a-MA06spVOqZu1-MaD"}\n␞\n\n␞\n{"type":"comment","value":"MODERATION_START"}\n␞\n\n␞\n{"type":"comment","value":"MODERATING"}\n␞\n',
      createdAt: fixedDate,
    },
  ],
  stableAndStreaming: [
    {
      content:
        "Create a lesson plan about the end of Roman Britain for key stage 3 history",
      role: "user",
      id: "u-ROEdSl4mxvurLJqg",
      createdAt: fixedDate,
    },
    {
      id: "a-G7_z8CnQIGUjdFEk",
      role: "assistant",
      content:
        '\n␞\n{"type":"patch","reasoning":"generated","value":{"op":"add","path":"/title","value":"The end of Roman Britain"},"status":"complete"}\n␞\n\n␞\n{"type":"patch","reasoning":"generated","value":{"op":"add","path":"/subject","value":"history"},"status":"complete"}\n␞\n\n␞\n{"type":"patch","reasoning":"generated","value":{"op":"add","path":"/keyStage","value":"key-stage-3"},"status":"complete"}\n␞\n\n␞\n{"type":"comment","value":"CHAT_START"}\n␞\n{"type":"llmMessage","sectionsToEdit":[],"patches":[],"sectionsEdited":[],"prompt":{"type":"text","value":"These Oak lessons might be relevant:\\n1. The End of Roman Britain\\n2. Anglo-Saxon Society and the Dark Ages\\n3. The Anglo-Saxon Kingdoms\\n4. The arrival of the Anglo-Saxons\\n5. The return of towns in Anglo-Saxon Britain\\n\\nTo base your lesson on one of these existing Oak lessons, type the lesson number. Tap **Continue** to start from scratch."},"status":"complete"}\n␞\n{"type":"id","value":"a-G7_z8CnQIGUjdFEk"}\n␞\n\n␞\n{"type":"comment","value":"MODERATION_START"}\n␞\n\n␞\n{"type":"comment","value":"MODERATING"}\n␞\n\n␞\n{"type":"moderation","categories":[],"id":"cm6uzvfh1000nn41l37dl414n"}\n␞\n\n␞\n{"type":"comment","value":"CHAT_COMPLETE"}\n␞\n',
      createdAt: fixedDate,
    },
    {
      content: "continue",
      role: "user",
      id: "u-U53lt6NJM6Pqjz4L",
      createdAt: fixedDate,
    },
    {
      id: "TEMP_PENDING_wNvS0UN9dKM6eCgmLU54w",
      role: "assistant",
      content:
        '\n␞\n{"type":"comment","value":"CHAT_START"}\n␞\n{"type":"llmMessage","sectionsToEdit":[],"patches":[{"type":"patch","reasoning":"Setting the learning outcome to ',
      createdAt: fixedDate,
    },
  ],
  streamingMessage: [
    {
      id: "TEMP_PENDING_wNvS0UN9dKM6eCgmLU54w",
      role: "assistant",
      content:
        '\n␞\n{"type":"comment","value":"CHAT_START"}\n␞\n{"type":"llmMessage","sectionsToEdit":["learningOutcome","learningCycles","priorKnowledge","keyLearningPoints"],"patches":[{"type":"patch","reasoning":"Set the learning outcome to focus the lesson on the impact of the Roman Empire\'s departure from Britain.","value":{"type":"string","op":"add","path":"/learningOutcome","value":"I can describe the impact of the Roman Empire\'s departure from Britain."},"status":"complete"},{"type":"patch","reasoning":"Break down the learning outcome into specific learning cycles to guide the lesson structure.","value":{"type":"string-array","op":"add","path":"/learningCycles","value":["Explain why the Roman Empire left Britain","Describe the changes in Britain after the Romans left","Recognise the role of archaeologists in understanding Roman Britain"]},"status":"complete"},{"type":"',
      createdAt: fixedDate,
    },
  ],
};

const id = "test-id";

const setupStore = (initialValues?: Partial<ChatStore>) => {
  const trpcUtils = {} as TrpcUtils;
  const store = createChatStore(id, trpcUtils, initialValues);
  const modStore = createModerationStore({ id: "123", trpcUtils });

  store.setState((state) => ({
    ...state,
    moderationActions: modStore.getState(),
  }));
  return store;
};

describe("Chat Store setMessages", () => {
  test("When there no messages, loading true throw error", () => {
    const store = setupStore();

    expect(() => {
      store.getState().setMessages([], true);
    }).toThrow();
  });

  test("expected state when there no messages, loading false", () => {
    const store = setupStore();
    const initialState = store.getState();
    store.getState().setMessages([], false);
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
      .setMessages(messageStates.streamingMessage as AiMessage[], true);

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
      .setMessages(messageStates.stableAndStreaming as AiMessage[], true);

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
      .setMessages(messageStates.stableMessages as AiMessage[], true);

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
      .setMessages(messageStates.userRequest as AiMessage[], false);

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
        isEditing: true,
      },
    ]);

    expect(newState.ailaStreamingStatus).toBe("Idle");
  });
  test("execute queued action is called when streaming status changes to idle and there is a queued item", () => {
    const store = setupStore({
      executeQueuedAction,
      queuedUserAction: "continue",
      ailaStreamingStatus: "Loading",
    });
    store
      .getState()
      .setMessages(messageStates.stableMessages as AiMessage[], false);

    expect(executeQueuedAction).toHaveBeenCalled();
  });
  test("No executeQueuedAction call when streaming status changes to Idle and no queued action", () => {
    const store = setupStore({
      executeQueuedAction,
      queuedUserAction: null,
      ailaStreamingStatus: "StreamingLessonPlan",
    });

    store
      .getState()
      .setMessages(messageStates.stableMessages as AiMessage[], false);

    expect(executeQueuedAction).not.toHaveBeenCalled();
  });
  test("Streaming message correctly marked as partial", () => {
    const store = setupStore();
    store
      .getState()
      .setMessages(messageStates.streamingMessage as AiMessage[], true);

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
      .setMessages(messageStates.stableMessages as AiMessage[], true);

    const initialState = store.getState();

    store
      .getState()
      .setMessages(messageStates.stableMessages as AiMessage[], true);

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
      .setMessages(messageStates.stableMessages as AiMessage[], true);
    const initialState = store.getState();
    store
      .getState()
      .setMessages(messageStates.stableMessages as AiMessage[], true);
    const newState = store.getState();
    expect(renderSpy).toHaveBeenCalledTimes(2);
    expect(newState.stableMessages).toBe(initialState.stableMessages);
  });
  test("ailaStreamingStatus updates correctly based on messages", () => {
    const store = setupStore();
    store
      .getState()
      .setMessages(messageStates.stableMessages as AiMessage[], true);
    expect(store.getState().ailaStreamingStatus).toBe("Moderating");

    store
      .getState()
      .setMessages(messageStates.userRequest as AiMessage[], false);
    expect(store.getState().ailaStreamingStatus).toBe("Idle");
  });
});
