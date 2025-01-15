import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { generateMessageId } from "@oakai/aila/src/helpers/chat/generateMessageId";
import { aiLogger } from "@oakai/logger";
import { type ChatRequestOptions } from "ai";
import { type Message, useChat } from "ai/react";
import { useChatStore } from "store/useChatStore";

const log = aiLogger("chat");

const AiSdkContext = createContext<{
  append: (
    message: Message,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  stop: () => void;
}>({
  append: () => Promise.resolve(null),
  stop: () => {},
});

export type AiSdkContextProps = {
  id: string;
  children: React.ReactNode;
};

const options = {
  useRag: true,
  temperature: 0.7,
};

export function AiSdk({ id, children }: Readonly<AiSdkContextProps>) {
  const setMessages = useChatStore((state) => state.setMessages);
  const setIsLoading = useChatStore((state) => state.setIsLoading);
  // const setAiSdkActions = useChatStore((state) => state.setAiSdkActions);

  // TODO: is this always rerendering all children?
  const aiState = useChat({
    sendExtraMessageFields: true,
    id,
    generateId: () => generateMessageId({ role: "user" }),
    body: {
      id,
      lessonPlan: {}, // TODO
      options,
    },

    onResponse: (response) => {
      log.info("onResponse", response);
    },
    onFinish: (message, finishReason) => {
      log.info("onFinish", message, finishReason);
      // TODO: set manual loading?
    },
    onError: (error) => {
      log.error("onError", error);
      // TODO: set manual loading?
    },
  });

  useEffect(() => {
    // const lastMessage = aiState.messages[aiState.messages.length - 1];
    // log.info("messages updated");
    // log.info("messages", aiState.messages);
    // log.info("lastMessage", lastMessage);
    // log.info("isLoading", aiState.isLoading);
    setMessages(aiState.messages, aiState.isLoading);
  }, [aiState.messages, setMessages, aiState.isLoading]);

  // TODO: set explicitly with onFinish/onError, etc
  useEffect(() => {
    log.info("isLoading updated", aiState.isLoading);
    setIsLoading(aiState.isLoading);
  }, [aiState.isLoading, setIsLoading]);

  // useEffect(() => {
  //   setAiSdkActions({
  //     append: aiState.append,
  //     stop: aiState.stop,
  //   });
  // }, [aiState.append, aiState.stop, setAiSdkActions]);
  //
  const actions = useMemo(() => {
    console.log("actions updated");
    return {
      append: aiState.append,
      stop: aiState.stop,
    };
    // TODO: explain stable append
  }, []);
  // }, [aiState.append, aiState.stop]);

  return (
    <AiSdkContext.Provider value={actions}>{children}</AiSdkContext.Provider>
  );
}

export const useAiSdkActions = () => {
  const context = useContext(AiSdkContext);
  if (!context) {
    throw new Error("useAiSdkActions must be used within a ChatLoader");
  }
  return context;
};
