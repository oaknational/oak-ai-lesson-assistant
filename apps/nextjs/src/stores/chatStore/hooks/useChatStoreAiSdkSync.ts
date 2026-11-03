import { useEffect } from "react";

import { useChatActions } from "@/stores/AilaStoresProvider";
import type { AiMessage, AiSdkActions } from "@/stores/chatStore/types";

export const useChatStoreAiSdkSync = (
  messages: AiMessage[],
  isLoading: boolean,
  stop: AiSdkActions["stop"],
  append: AiSdkActions["append"],
  reload: AiSdkActions["reload"],
  initializeMessages: AiSdkActions["initializeMessages"],
) => {
  const { setMessages, setAiSdkActions } = useChatActions();

  useEffect(() => {
    setMessages(messages, isLoading);
  }, [messages, isLoading, setMessages]);

  useEffect(() => {
    setAiSdkActions({ stop, append, reload, initializeMessages });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
