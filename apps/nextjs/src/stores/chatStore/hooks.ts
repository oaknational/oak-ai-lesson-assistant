import { useEffect } from "react";

import type {
  Message as AiMessage,
  ChatRequestOptions,
  CreateMessage,
  Message,
} from "ai";

import { useChatStore } from "./index";

// Hooks to update the Zustand chat store mirror from the AI SDK outputs
export const useChatStoreMirror = (
  messages: AiMessage[],
  isLoading: boolean,
  stop: () => void,
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions | undefined,
  ) => Promise<string | null | undefined>,
  reload: () => void,
) => {
  const setMessages = useChatStore((state) => state.setMessages);
  const setStop = useChatStore((state) => state.setStop);
  const setAppend = useChatStore((state) => state.setAppend);
  const setReload = useChatStore((state) => state.setReload);

  useEffect(() => {
    setMessages(messages, isLoading);
  }, [messages, isLoading, setMessages]);

  useEffect(() => {
    setStop(stop);
  }, [stop, setStop]);

  useEffect(() => {
    setAppend(append);
  }, [append, setAppend]);

  useEffect(() => {
    setReload(reload);
  }, [reload, setReload]);
};
