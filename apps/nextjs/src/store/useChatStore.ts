// stores/useChatStore.ts
import type { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";
import type { Message } from "ai";
import { create } from "zustand";

const messageIds = (messages: Message[]) => messages.map((m) => m.id).join(",");

type ChatStore = {
  id: string;
  chat: AilaPersistedChat | undefined;
  isLoading: boolean;
  isStreaming: boolean;
  input: string;
  hasFinished: boolean;
  queuedUserAction: string | null;
  chatAreaRef: React.RefObject<HTMLDivElement> | null;

  stableMessages: Message[];
  currentMessage: Message | null;

  // Actions
  setChat: (chat: AilaPersistedChat) => void;
  setMessages: (messages: Message[], isLoading: boolean) => void;
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
        stableMessages: messages,
        currentMessage: null,
      });
    } else {
      const currentMessage = messages[messages.length - 1];
      const stableMessages = messages.slice(0, messages.length - 1);
      const stableMessagesChanged =
        messageIds(stableMessages) !== messageIds(get().stableMessages);
      console.log({
        currentIds: messageIds(get().stableMessages),
        newIds: messageIds(stableMessages),
        stableMessagesChanged: stableMessagesChanged,
      });
      set({
        currentMessage,
        ...(stableMessagesChanged && { stableMessages }),
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
