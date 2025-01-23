import React, { useEffect } from "react";

import type { Decorator } from "@storybook/react";

import {
  useChatStore,
  type AilaStreamingStatus,
} from "../../src/stores/chatStore";

declare module "@storybook/csf" {
  interface Parameters {
    chatStoreState?: {
      ailaStreamingStatus?: AilaStreamingStatus;
      queuedUserAction?: string | null;
      isStreaming?: boolean;
    };
  }
}

export const ChatStoreDecorator: Decorator = (Story, { parameters }) => {
  const reset = useChatStore((state) => state.reset);

  useEffect(() => {
    if (!parameters.chatStoreState) {
      return;
    }
    // This was to get around a type check, can clean up once reset is removed
    const { ailaStreamingStatus, ...rest } = parameters.chatStoreState;
    reset({
      ailaStreamingStatus: ailaStreamingStatus!,
      ...rest,
    });
  }, [reset]);

  return <Story />;
};
