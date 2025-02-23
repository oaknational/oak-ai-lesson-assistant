import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import type { ChatRequestOptions, CreateMessage } from "ai";
import { createStore } from "zustand";

import type { TrpcUtils } from "@/utils/trpc";

import type { GetStore } from "../AilaStoresProvider";
import { logStoreUpdates } from "../zustandHelpers";
import { handleAppend } from "./stateActionFunctions/handleAppend";
import { handleExecuteQueuedAction } from "./stateActionFunctions/handleExecuteQueuedAction";
import { handleFetchInitialMessages } from "./stateActionFunctions/handleFetchInitialMessages";
import { handleScrollToBottom } from "./stateActionFunctions/handleScrollToBottom";
import { handleSetMessages } from "./stateActionFunctions/handleSetMessages";
import { handleStop } from "./stateActionFunctions/handleStop";
import { handleStreamingFinished } from "./stateActionFunctions/handleStreamingFinished";
import type { AiMessage, ParsedMessage } from "./types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = aiLogger("chat:store");

export type AiSdkActions = {
  stop: () => void;
  reload: () => Promise<string | null | undefined>;
  append: (
    message: AiMessage | CreateMessage,
    chatRequestOptions?: ChatRequestOptions | undefined,
  ) => Promise<string | null | undefined>;
};

export type AilaStreamingStatus =
  | "Loading"
  | "RequestMade"
  | "StreamingLessonPlan"
  | "StreamingChatResponse"
  | "StreamingExperimentalPatches"
  | "Moderating"
  | "Idle";

export type ChatStore = {
  id: string;
  ailaStreamingStatus: AilaStreamingStatus;

  initialMessages: AiMessage[];
  stableMessages: ParsedMessage[];
  streamingMessage: ParsedMessage | null;
  queuedUserAction: string | null;
  lessonPlan: LooseLessonPlan | null;
  input: string;
  chatAreaRef: React.RefObject<HTMLDivElement> | null;

  // From AI SDK
  aiSdkActions: AiSdkActions;

  // Setters
  setLessonPlan: (lessonPlan: LooseLessonPlan) => void;
  setAiSdkActions: (actions: AiSdkActions) => void;
  setMessages: (messages: AiMessage[], isLoading: boolean) => void;
  setInput: (input: string) => void;
  setChatAreaRef: (ref: React.RefObject<HTMLDivElement>) => void;

  // Action functions
  executeQueuedAction: () => void;
  append: (message: string) => void;
  stop: () => void;
  streamingFinished: () => void;
  scrollToBottom: () => void;
  fetchInitialMessages: () => Promise<void>;
};

export const createChatStore = (
  id: string,
  getStore: GetStore,
  trpcUtils: TrpcUtils,
  initialValues: Partial<ChatStore> = {},
) => {
  const chatStore = createStore<ChatStore>((set, get) => ({
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

    ...initialValues,
  }));

  logStoreUpdates(chatStore, "chat:store");
  return chatStore;
};
