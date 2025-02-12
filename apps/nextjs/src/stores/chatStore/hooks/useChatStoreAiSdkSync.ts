import { useEffect } from "react";

import type {
  Message as AiMessage,
  ChatRequestOptions,
  CreateMessage,
  Message,
} from "ai";

import { useChatStore } from "@/stores/AilaStoresProvider";

export const useChatStoreAiSdkSync = (
  messages: AiMessage[],
  isLoading: boolean,
  stop: () => void,
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions | undefined,
  ) => Promise<string | null | undefined>,
  reload: () => Promise<string | null | undefined>,
) => {
  const setMessages = useChatStore((state) => state.setMessages);
  const setAiSdkActions = useChatStore((state) => state.setAiSdkActions);

  useEffect(() => {
    setMessages(messages, isLoading);
  }, [messages, isLoading, setMessages]);

  useEffect(() => {
    setAiSdkActions({ stop, append, reload });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
