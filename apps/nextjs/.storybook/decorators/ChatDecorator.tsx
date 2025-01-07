import React from "react";

import type { Decorator } from "@storybook/react";

import {
  ChatContext,
  type ChatContextProps,
} from "../../src/components/ContextProviders/ChatProvider";

declare module "@storybook/csf" {
  interface Parameters {
    chatContext?: Partial<ChatContextProps>;
  }
}

export const ChatDecorator: Decorator = (Story, { parameters }) => (
  <ChatContext.Provider value={parameters.chatContext as ChatContextProps}>
    <Story />
  </ChatContext.Provider>
);
