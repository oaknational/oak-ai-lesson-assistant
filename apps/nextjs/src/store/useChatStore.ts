// stores/useChatStore.ts
import {
  type MessagePart,
  parseMessageParts,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";
import type { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import type { Message as AiMessage } from "ai";
import { create } from "zustand";

const messageIds = (messages: AiMessage[]) =>
  messages.map((m) => m.id).join(",");

const log = aiLogger("chat:store");

type ChatStore = {
  id: string;
  chat: AilaPersistedChat | undefined;
  isLoading: boolean;
  isStreaming: boolean;
  input: string;
  hasFinished: boolean;
  queuedUserAction: string | null;
  chatAreaRef: React.RefObject<HTMLDivElement> | null;

  stableMessages: MessageWithParts[];
  currentMessage: MessageWithParts | null;

  // Actions
  setChat: (chat: AilaPersistedChat) => void;
  setMessages: (messages: AiMessage[], isLoading: boolean) => void;
  setInput: (input: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setHasFinished: (hasFinished: boolean) => void;
  queueUserAction: (action: string) => void;
  clearQueuedAction: () => void;
  setChatAreaRef: (ref: React.RefObject<HTMLDivElement>) => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  id: "",
  chat: undefined,
  isLoading: false,
  isStreaming: false,
  input: "",
  hasFinished: true,
  queuedUserAction: null,
  chatAreaRef: null,

  stableMessages: [],
  currentMessage: null,

  setChat: (chat) => set({ chat }),
  setMessages: (messages, isLoading) => {
    if (!isLoading) {
      set({
        stableMessages: parseMessages(messages),
        currentMessage: null,
      });
    } else {
      const currentMessage = messages[messages.length - 1];
      const stableMessages = messages.slice(0, messages.length - 1);
      const stableMessagesChanged =
        messageIds(stableMessages) !== messageIds(get().stableMessages);
      set({
        currentMessage: currentMessage ? parseMessage(currentMessage) : null,
        ...(stableMessagesChanged && {
          stableMessages: parseMessages(stableMessages),
        }),
      });
    }
  },
  setInput: (input) => set({ input }),
  setIsLoading: (isLoading) => set({ isLoading }),
  // TODO: confirm that it's different to isLoading
  setHasFinished: (hasFinished) => set({ hasFinished }),
  queueUserAction: (action) => set({ queuedUserAction: action }),
  clearQueuedAction: () => set({ queuedUserAction: null }),
  setChatAreaRef: (ref) => set({ chatAreaRef: ref }),
}));

export type MessageWithParts = AiMessage & {
  parts: MessagePart[];
  hasError: boolean;
  isEditing: boolean;
};

const parseMessages = (messages: AiMessage[]): MessageWithParts[] => {
  return messages.map((m) => parseMessage(m));
};

const parseMessage = (
  message: AiMessage,
  previousResult?: MessageWithParts,
): MessageWithParts => {
  try {
    const parts = parseMessageParts(message.content);
    return {
      ...message,
      parts,
      hasError: parts.some((part) => part.document.type === "error"),
      isEditing:
        // TODO: this used to look at ailaStreamingStatus.
        // Our equivalent would be to only add it to a currentMessage
        parts.some((part) => part.isPartial) ||
        parts.filter((part) => ["bad", "text", "prompt"].includes(part.type))
          .length === 0,
    };
  } catch (e) {
    if (previousResult && message.id === previousResult.id) {
      log.warn("Failed to parse message. Using previous message", e);
      return previousResult;
    } else {
      log.warn("Failed to parse message. Bailing", e);
      throw e;
    }
  }
};
