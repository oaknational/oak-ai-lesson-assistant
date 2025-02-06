import React, { useEffect } from "react";

import type { Decorator } from "@storybook/react";

import {
  useChatStore,
  type AilaStreamingStatus,
} from "../../src/stores/chatStore";

declare module "@storybook/csf" {
  interface Parameters {
    chatStoreState?: {
      ailaStreamingStatus: AilaStreamingStatus;
      queuedUserAction?: string | null;
    };
  }
}

export const ChatStoreDecorator: Decorator = (Story, { parameters }) => {
  const reset = useChatStore((state) => state.reset);

  useEffect(() => {
    if (!parameters.chatStoreState) {
      return;
    }
    reset({
      ...parameters.chatStoreState,
    });
  }, [reset]);

  return <Story />;
};
