import { aiLogger } from "@oakai/logger";
import type { ChatRequestOptions, CreateMessage, Message } from "ai";
import invariant from "tiny-invariant";
import { create } from "zustand";

import { handleExecuteQueuedAction } from "./actionFunctions/handleExecuteQueuedAction";
import { handleSetMessages } from "./actionFunctions/handleSetMessages";
import { getNextStableMessages, parseStreamingMessage } from "./parsing";
import type { AiMessage, ParsedMessage } from "./types";

const log = aiLogger("chat:store");

type ChatStore = {
  // From AI SDK
  isLoading: boolean;
  stableMessages: ParsedMessage[];
  streamingMessage: ParsedMessage | null;
  queuedUserAction: string | null;
  isExecutingAction: boolean;

  // Actions
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions | undefined,
  ) => Promise<string | null | undefined>;
  reload: () => void;
  setAppend: (
    append: (
      message: Message | CreateMessage,
      chatRequestOptions?: ChatRequestOptions | undefined,
    ) => Promise<string | null | undefined>,
  ) => void;
  setReload: (reload: () => void) => void;
  stop: () => void;
  setMessages: (messages: AiMessage[], isLoading: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setStop: (stop: () => void) => void;
  queueUserAction: (action: string) => void;
  executeQueuedAction: () => Promise<void>;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  // From AI SDK
  isLoading: false,
  stableMessages: [],
  streamingMessage: null,
  queuedUserAction: null,
  isExecutingAction: false,

  // Actions
  stop: () => {},
  append: async () => "",
  reload: () => {},
  setAppend: (append) => set({ append }),
  setReload: (reload) => set({ reload }),
  queueUserAction: (action: string) => {
    set({ queuedUserAction: action });
  },
  setStop: (stop) => set({ stop }),
  setIsLoading: (isLoading) => set({ isLoading }),

  // Action functions
  executeQueuedAction: handleExecuteQueuedAction(set, get),
  setMessages: handleSetMessages(set, get),
}));

useChatStore.subscribe((state) => {
  log.info("Chat store updated", state);
});
