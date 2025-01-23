import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import type { ChatRequestOptions, CreateMessage, Message } from "ai";
import { create } from "zustand";

import { handleExecuteQueuedAction } from "./stateActionFunctions/handleExecuteQueuedAction";
import { handleQueueUserAction } from "./stateActionFunctions/handleQueueUserAction";
import { handleSetMessages } from "./stateActionFunctions/handleSetMessages";
import type { AiMessage, ParsedMessage } from "./types";

const log = aiLogger("chat:store");

type Actions = {
  stop: () => void;
  reload: () => void;
  append: (
    message: Message | CreateMessage,
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
  | "Idle"
  | undefined;

export type ChatStore = {
  ailaStreamingStatus: AilaStreamingStatus;

  // From AI SDK
  isLoading: boolean;
  stableMessages: ParsedMessage[];
  streamingMessage: ParsedMessage | null;
  queuedUserAction: string | null;
  isExecutingQueuedAction: boolean;
  lessonPlan: LooseLessonPlan | null;
  // Grouped Actions
  actions: Actions;

  // Setters
  setLessonPlan: (lessonPlan: LooseLessonPlan) => void;
  setAiSdkActions: (actions: Actions) => void;
  setMessages: (messages: AiMessage[], isLoading: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  queueUserAction: (action: string) => Promise<void>;
  executeQueuedAction: () => Promise<void>;

  reset: (
    params: Pick<ChatStore, "ailaStreamingStatus"> & {
      queuedUserAction?: ChatStore["queuedUserAction"];
    },
  ) => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  ailaStreamingStatus: undefined,
  stableMessages: [],
  streamingMessage: null,
  queuedUserAction: null,
  isExecutingQueuedAction: false,
  lessonPlan: null,
  // From AI SDK
  isLoading: false,
  actions: {
    stop: () => {},
    reload: () => {},
    append: async () => "",
  },

  // Setters
  setAiSdkActions: (actions) => set({ actions }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setLessonPlan: (lessonPlan) => set({ lessonPlan }),

  // Action functions
  queueUserAction: handleQueueUserAction(set, get),
  executeQueuedAction: handleExecuteQueuedAction(set, get),
  setMessages: handleSetMessages(set, get),

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
