import { aiLogger } from "@oakai/logger";
import invariant from "tiny-invariant";
import { create } from "zustand";

import { getNextStableMessages, parseStreamingMessage } from "./parsing";
import type { AiMessage, ParsedMessage } from "./types";

const log = aiLogger("chat:store");

type ChatStore = {
  // From AI SDK
  isLoading: boolean;
  stableMessages: ParsedMessage[];
  streamingMessage: ParsedMessage | null;

  // Actions
  setMessages: (messages: AiMessage[], isLoading: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearMessages: () => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  // From AI SDK
  isLoading: false,
  stableMessages: [],
  streamingMessage: null,

  // Actions
  setMessages: (messages, isLoading) => {
    if (!isLoading) {
      // All messages are stable
      const nextStableMessages = getNextStableMessages(
        messages,
        get().stableMessages,
      );
      set({
        ...(nextStableMessages && {
          stableMessages: nextStableMessages,
        }),
        streamingMessage: null,
      });
    } else {
      // The latest message is streaming, previous messages are stable
      const currentMessageData = messages[messages.length - 1];
      // invariant(currentMessageData, "Should have at least one message");
      invariant(currentMessageData, "Should have at least one message");
      const streamingMessage = parseStreamingMessage(
        currentMessageData,
        get().streamingMessage,
      );

      const stableMessageData = messages.slice(0, messages.length - 1);
      const nextStableMessages = getNextStableMessages(
        stableMessageData,
        get().stableMessages,
      );

      set({
        streamingMessage,
        ...(nextStableMessages && {
          stableMessages: nextStableMessages,
        }),
      });
    }
  },
  setIsLoading: (isLoading) => set({ isLoading }),
  clearMessages: () => set({ stableMessages: [], streamingMessage: null }),
}));

useChatStore.subscribe((state) => {
  log.info("Chat store updated", state);
});
