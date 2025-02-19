import React, { useMemo } from "react";

import type { Decorator } from "@storybook/react";

import type { LessonPlanTrackingContextProps } from "@/lib/analytics/lessonPlanTrackingContext";
import { AilaStoresContext } from "@/stores/AilaStoresProvider";
import { createChatStore, type ChatStore } from "@/stores/chatStore";
import {
  createLessonPlanStore,
  type LessonPlanStore,
} from "@/stores/lessonPlanStore";
import {
  createModerationStore,
  type ModerationStore,
} from "@/stores/moderationStore";
import { type TrpcUtils } from "@/utils/trpc";

declare module "@storybook/csf" {
  interface Parameters {
    moderationStoreState?: Partial<ModerationStore>;
    chatStoreState?: Partial<ChatStore>;
    lessonPlanStoreState?: Partial<LessonPlanStore>;
  }
}
export const StoreDecorator: Decorator = (Story, { parameters }) => {
  const store = useMemo(() => {
    const id = "123";
    const trpcUtils = {} as TrpcUtils;
    const moderationStore = createModerationStore({
      id,
      trpcUtils,
      initialValues: parameters.moderationStoreState,
    });
    const chatStore = createChatStore(parameters.chatStoreState);
    const lessonPlanStore = createLessonPlanStore({
      id,
      trpcUtils,
      lessonPlanTracking: {} as unknown as LessonPlanTrackingContextProps,
      initialValues: parameters.lessonPlanStoreState,
    });

    return {
      chat: chatStore,
      moderation: moderationStore,
      lessonPlan: lessonPlanStore,
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
