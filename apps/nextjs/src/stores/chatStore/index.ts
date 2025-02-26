import { aiLogger } from "@oakai/logger";
import { createStore } from "zustand";

import type { TrpcUtils } from "@/utils/trpc";

import type { GetStore } from "../AilaStoresProvider";
import { logStoreUpdates } from "../zustandHelpers";
import { handleAilaStreamingStatusUpdated } from "./stateActionFunctions/handleAilaStreamingStatusUpdated";
import { handleAppend } from "./stateActionFunctions/handleAppend";
import { handleExecuteQueuedAction } from "./stateActionFunctions/handleExecuteQueuedAction";
import { handleFetchInitialMessages } from "./stateActionFunctions/handleFetchInitialMessages";
import { handleScrollToBottom } from "./stateActionFunctions/handleScrollToBottom";
import { handleSetMessages } from "./stateActionFunctions/handleSetMessages";
import { handleStop } from "./stateActionFunctions/handleStop";
import { handleStreamingFinished } from "./stateActionFunctions/handleStreamingFinished";
import type { ChatState } from "./types";

export * from "./types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = aiLogger("chat:store");

export const createChatStore = (
  id: string,
  getStore: GetStore,
  trpcUtils: TrpcUtils,
  initialValues: Partial<ChatState> = {},
) => {
  const chatStore = createStore<ChatState>((set, get) => ({
    id,
    moderationActions: undefined, // Passed in the provider
    ailaStreamingStatus: "Idle",
    initialMessages: [],
    stableMessages: [],
    streamingMessage: null,
    queuedUserAction: null,
    lessonPlan: null,
    input: "",
    chatAreaRef: null,

    // From AI SDK
    aiSdkActions: {
      stop: () => {},
      reload: () => Promise.resolve(null),
      append: () => Promise.resolve(""),
    },

    // Setters
    setAiSdkActions: (aiSdkActions) => set({ aiSdkActions }),
    setLessonPlan: (lessonPlan) => set({ lessonPlan }),
    setInput: (input) => set({ input }),
    setChatAreaRef: (ref) => set({ chatAreaRef: ref }),

    // Action functions
    executeQueuedAction: handleExecuteQueuedAction(set, get),
    append: handleAppend(set, get),
    stop: handleStop(set, get),
    setMessages: handleSetMessages(getStore, set, get),
    streamingFinished: handleStreamingFinished(set, get),
    scrollToBottom: handleScrollToBottom(set, get),
    fetchInitialMessages: handleFetchInitialMessages(set, get, trpcUtils),
    ailaStreamingStatusUpdated: handleAilaStreamingStatusUpdated(set, get),

    ...initialValues,
  }));

  logStoreUpdates(chatStore, "chat:store");
  return chatStore;
};
