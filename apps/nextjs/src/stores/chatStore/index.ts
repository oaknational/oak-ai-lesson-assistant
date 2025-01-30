import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import type { ChatRequestOptions, CreateMessage } from "ai";
import { create } from "zustand";

import { handleAppend } from "./stateActionFunctions/handleAppend";
import { handleExecuteQueuedAction } from "./stateActionFunctions/handleExecuteQueuedAction";
import { handleSetMessages } from "./stateActionFunctions/handleSetMessages";
import { handleStop } from "./stateActionFunctions/handleStop";
import { handleStreamingFinished } from "./stateActionFunctions/handleStreamingFinished";
import type { AiMessage, ParsedMessage } from "./types";

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

  reset: (
    params: Pick<ChatStore, "ailaStreamingStatus"> & {
      queuedUserAction?: ChatStore["queuedUserAction"];
    },
  ) => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  ailaStreamingStatus: "Idle",
  stableMessages: [],
  streamingMessage: null,
  queuedUserAction: null,
  lessonPlan: null,

  // From AI SDK
  aiSdkActions: {
    stop: () => {},
    reload: () => {},
    append: async () => "",
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

  // reset
  reset: ({ ailaStreamingStatus = "Idle", queuedUserAction }) => {
    set({
      ailaStreamingStatus: ailaStreamingStatus,
      queuedUserAction: queuedUserAction,
    });
  },
}));

useChatStore.subscribe((state) => {
  log.info("Chat store updated", state);
});
