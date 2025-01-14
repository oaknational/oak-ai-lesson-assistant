// stores/useChatStore.ts
import type { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";
import type { Message } from "ai";
import { create } from "zustand";

type ChatStore = {
  id: string;
  chat: AilaPersistedChat | undefined;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  input: string;
  hasFinished: boolean;
  queuedUserAction: string | null;
  chatAreaRef: React.RefObject<HTMLDivElement> | null;

  // Actions
  setChat: (chat: AilaPersistedChat) => void;
  setMessages: (messages: Message[]) => void;
  setInput: (input: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setHasFinished: (hasFinished: boolean) => void;
  queueUserAction: (action: string) => void;
  clearQueuedAction: () => void;
  setChatAreaRef: (ref: React.RefObject<HTMLDivElement>) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  id: "",
  chat: undefined,
  messages: [],
  isLoading: false,
  isStreaming: false,
  input: "",
  hasFinished: true,
  queuedUserAction: null,
  chatAreaRef: null,

  setChat: (chat) => set({ chat }),
  setMessages: (messages) => set({ messages }),
  setInput: (input) => set({ input }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setHasFinished: (hasFinished) => set({ hasFinished }),
  queueUserAction: (action) => set({ queuedUserAction: action }),
  clearQueuedAction: () => set({ queuedUserAction: null }),
  setChatAreaRef: (ref) => set({ chatAreaRef: ref }),
}));
