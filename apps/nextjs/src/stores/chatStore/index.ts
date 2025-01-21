import { aiLogger } from "@oakai/logger";
import type { ChatRequestOptions, CreateMessage, Message } from "ai";
import { create } from "zustand";

import { handleExecuteQueuedAction } from "./actionFunctions/handleExecuteQueuedAction";
import { handleSetMessages } from "./actionFunctions/handleSetMessages";
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

type ChatStore = {
  // From AI SDK
  isLoading: boolean;
  stableMessages: ParsedMessage[];
  streamingMessage: ParsedMessage | null;
  queuedUserAction: string | null;
  isExecutingAction: boolean;

  // Grouped Actions
  actions: Actions;

  // Setters
  setAiSdkActions: (actions: Actions) => void;
  setMessages: (messages: AiMessage[], isLoading: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  queueUserAction: (action: string) => Promise<void>;
  executeQueuedAction: () => Promise<void>;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  // From AI SDK
  isLoading: false,
  stableMessages: [],
  streamingMessage: null,
  queuedUserAction: null,
  isExecutingAction: false,

  actions: {
    stop: () => {},
    reload: () => {},
    append: async () => "",
  },
  setAiSdkActions: (actions) => set({ actions }),
  queueUserAction: async (action: string) => {
    set({ queuedUserAction: action });
    await get().executeQueuedAction();
  },
  setIsLoading: (isLoading) => set({ isLoading }),

  // Action functions
  executeQueuedAction: handleExecuteQueuedAction(set, get),
  setMessages: handleSetMessages(set, get),
}));

useChatStore.subscribe((state) => {
  log.info("Chat store updated", state);
});
