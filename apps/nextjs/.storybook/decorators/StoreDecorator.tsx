import React, { useMemo } from "react";

import type { Decorator } from "@storybook/react";

import { AilaStoresContext } from "@/stores/AilaStoresProvider";
import { createChatStore, type ChatStore } from "@/stores/chatStore";
import { createLessonPlanStore } from "@/stores/lessonPlanStore";
import {
  createModerationStore,
  type ModerationStore,
} from "@/stores/moderationStore";
import { type TrpcUtils } from "@/utils/trpc";

declare module "@storybook/csf" {
  interface Parameters {
    moderationStoreState?: Partial<ModerationStore>;
    chatStoreState?: Partial<ChatStore>;
  }
}

export const StoreDecorator: Decorator = (Story, { parameters }) => {
  const store = useMemo(() => {
    const id = "123";
    const trpcUtils = {} as TrpcUtils;
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
      lessonPlan: createLessonPlanStore(
        id,
        trpcUtils,
        parameters.lessonPlanStoreState,
      ),
    };
  }, [
    parameters.moderationStoreState,
    parameters.chatStoreState,
    parameters.lessonPlanStoreState,
  ]);

  return (
    <AilaStoresContext.Provider value={store}>
      <Story />
    </AilaStoresContext.Provider>
  );
};
