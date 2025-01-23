import React, { useEffect } from "react";

import type { Decorator } from "@storybook/react";

import { useChatStore, type ChatStore } from "../../src/stores/chatStore";

declare module "@storybook/csf" {
  interface Parameters {
    chatStoreState?: Partial<ChatStore>;
  }
}

export const ChatStoreDecorator: Decorator = (Story, { parameters }) => {
  useEffect(() => {
    if (!parameters.chatStoreState) {
      return;
    }
    useChatStore.setState(parameters.chatStoreState);
  }, [parameters.chatStoreState]);

  return <Story />;
};
