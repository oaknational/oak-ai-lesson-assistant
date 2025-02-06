import React, { useMemo } from "react";

import type { Decorator } from "@storybook/react";

import { AilaStoresContext } from "@/stores/AilaStoresProvider";
import { createChatStore, type ChatStore } from "@/stores/chatStore";
import {
  createModerationStore,
  type ModerationStore,
} from "@/stores/moderationStore";
import { trpc } from "@/utils/trpc";

declare module "@storybook/csf" {
  interface Parameters {
    moderationStoreState?: Partial<ModerationStore>;
    chatStoreState?: Partial<ChatStore>;
  }
}

export const StoreDecorator: Decorator = (Story, { parameters }) => {
  const store = useMemo(() => {
    const id = "123";
    const trpcUtils = trpc.useUtils();
    const moderationStore = createModerationStore({ id, trpcUtils });
    const chatStore = createChatStore();

    moderationStore.setState((state) => ({
      ...state,
      ...parameters.moderationStoreState,
      chatActions: chatStore.getState(),
    }));

    chatStore.setState((state) => ({
      ...state,
      ...parameters.chatStoreState,
      moderationActions: moderationStore.getState(),
    }));

    return {
      chat: chatStore,
      moderation: moderationStore,
    };
  }, [parameters.moderationStoreState, parameters.chatStoreState]);

  return (
    <AilaStoresContext.Provider value={store}>
      <Story />
    </AilaStoresContext.Provider>
  );
};
