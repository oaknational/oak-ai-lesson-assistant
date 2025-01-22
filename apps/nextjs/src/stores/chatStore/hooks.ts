import { useEffect } from "react";

import type { Message as AiMessage } from "ai";

import { useChatStore } from "./index";

// Hooks to update the Zustand chat store mirror from the AI SDK outputs
export const useChatStoreMirror = (
  messages: AiMessage[],
  isLoading: boolean,
) => {
  const setMessages = useChatStore((state) => state.setMessages);

  useEffect(() => {
    setMessages(messages, isLoading);
  }, [messages, isLoading, setMessages]);
};
