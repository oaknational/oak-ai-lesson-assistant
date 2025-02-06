import React, { useMemo } from "react";

import type { Decorator } from "@storybook/react";

import { AilaStoresContext } from "@/stores/AilaStoresProvider";
import { createChatStore, type ChatStore } from "@/stores/chatStore";
import {
  createLessonPlanStore,
  type LessonPlanStore,
} from "@/stores/lessonPlanStore";

declare module "@storybook/csf" {
  interface Parameters {
    chatStoreState?: Partial<ChatStore>;
    lessonPlanStoreState?: Partial<LessonPlanStore>;
  }
}

export const ChatStoreDecorator: Decorator = (Story, { parameters }) => {
  const value = useMemo(() => {
    return {
      chat: createChatStore(parameters.chatStoreState),
      lessonPlan: createLessonPlanStore(parameters.lessonPlanStoreState),
    };
  }, [parameters.chatStoreState]);

  return (
    <AilaStoresContext.Provider value={value}>
      <Story />
    </AilaStoresContext.Provider>
  );
};
