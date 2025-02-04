import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import type { ChatRequestOptions, CreateMessage } from "ai";
import { createStore } from "zustand";

import type { ModerationStore } from "../moderationStore";
import { logStoreUpdates } from "../zustandHelpers";
import { handleAppend } from "./stateActionFunctions/handleAppend";
import { handleExecuteQueuedAction } from "./stateActionFunctions/handleExecuteQueuedAction";
import { handleSetMessages } from "./stateActionFunctions/handleSetMessages";
import { handleStop } from "./stateActionFunctions/handleStop";
import { handleStreamingFinished } from "./stateActionFunctions/handleStreamingFinished";
import type { AiMessage, ParsedMessage } from "./types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = aiLogger("chat:store");

type AiSdkActions = {
  stop: () => void;
  reload: () => void;
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
  moderationActions?: Pick<ModerationStore, "fetchModerations">;
  ailaStreamingStatus: AilaStreamingStatus;

  stableMessages: ParsedMessage[];
  streamingMessage: ParsedMessage | null;
  queuedUserAction: string | null;
  lessonPlan: LooseLessonPlan | null;

  // From AI SDK
  aiSdkActions: AiSdkActions;

  // Setters
  setLessonPlan: (lessonPlan: LooseLessonPlan) => void;
  setAiSdkActions: (actions: AiSdkActions) => void;
  setMessages: (messages: AiMessage[], isLoading: boolean) => void;

  // Action functions
  executeQueuedAction: () => void;
  append: (message: string) => void;
  stop: () => void;
  streamingFinished: () => void;
};

export const createChatStore = (initialValues: Partial<ChatStore> = {}) => {
  const chatStore = createStore<ChatStore>((set, get) => ({
    moderationActions: undefined, // Passed in the provider
    ailaStreamingStatus: "Idle",
    stableMessages: [],
    streamingMessage: null,
    queuedUserAction: null,
    lessonPlan: null,

    // From AI SDK
    aiSdkActions: {
      stop: () => {},
      reload: () => {},
      append: async () => Promise.resolve(""),
    },

    // Setters
    setAiSdkActions: (aiSdkActions) => set({ aiSdkActions }),
    setLessonPlan: (lessonPlan) => set({ lessonPlan }),

    // Action functions
    executeQueuedAction: handleExecuteQueuedAction(set, get),
    append: handleAppend(set, get),
    stop: handleStop(set, get),
    setMessages: handleSetMessages(set, get),
    streamingFinished: handleStreamingFinished(set, get),

    ...initialValues,
  }));

  logStoreUpdates(chatStore, "chat:store");
  return chatStore;
};
