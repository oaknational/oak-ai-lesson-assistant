import React, { useMemo } from "react";

import type { Decorator } from "@storybook/react";

import { AilaStoresContext } from "@/stores/AilaStoresProvider";
import { createChatStore, type ChatStore } from "@/stores/chatStore";
import {
  createLessonPlanStore,
  type LessonPlanStore,
} from "@/stores/lessonPlanStore";
import { trpc, TrpcUtils } from "@/utils/trpc";

declare module "@storybook/csf" {
  interface Parameters {
    chatStoreState?: Partial<ChatStore>;
    lessonPlanStoreState?: Partial<LessonPlanStore>;
  }
}

export const ChatStoreDecorator: Decorator = (Story, { parameters }) => {
  const value = useMemo(() => {
    const id = "dummy-chat-id";
    const trpcUtils = {} as TrpcUtils;

    return {
      chat: createChatStore(parameters.chatStoreState),
      lessonPlan: createLessonPlanStore(
        id,
        trpcUtils,
        parameters.lessonPlanStoreState,
      ),
    };
  }, [parameters.chatStoreState]);

  return (
    <AilaStoresContext.Provider value={value}>
      <Story />
    </AilaStoresContext.Provider>
  );
};
