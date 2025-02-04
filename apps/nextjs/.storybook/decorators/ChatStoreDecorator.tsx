import React, { useMemo } from "react";

import type { Decorator } from "@storybook/react";

import { AilaStoresContext } from "@/stores/AilaStoresProvider";

import { createChatStore, type ChatStore } from "../../src/stores/chatStore";

declare module "@storybook/csf" {
  interface Parameters {
    chatStoreState?: Partial<ChatStore>;
  }
}

export const ChatStoreDecorator: Decorator = (Story, { parameters }) => {
  const value = useMemo(() => {
    return {
      chat: createChatStore(parameters.chatStoreState),
    };
  }, [parameters.chatStoreState]);

  return (
    <AilaStoresContext.Provider value={value}>
      <Story />
    </AilaStoresContext.Provider>
  );
};
