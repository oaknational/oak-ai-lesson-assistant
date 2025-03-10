import React, { useMemo } from "react";

import type { Decorator } from "@storybook/react";

import type { LessonPlanTrackingContextProps } from "@/lib/analytics/lessonPlanTrackingContext";
import type { AilaStores } from "@/stores/AilaStoresProvider";
import {
  AilaStoresContext,
  buildStoreGetter,
} from "@/stores/AilaStoresProvider";
import { createChatStore, type ChatState } from "@/stores/chatStore";
import {
  createLessonPlanStore,
  type LessonPlanState,
} from "@/stores/lessonPlanStore";
import {
  createModerationStore,
  type ModerationState,
} from "@/stores/moderationStore";
import { type TrpcUtils } from "@/utils/trpc";

declare module "@storybook/csf" {
  interface Parameters {
    moderationStoreState?: Partial<ModerationState>;
    chatStoreState?: Partial<ChatState>;
    lessonPlanStoreState?: Partial<LessonPlanState>;
  }
}
export const StoreDecorator: Decorator = (Story, { parameters }) => {
  const store = useMemo(() => {
    const id = "123";
    const trpcUtils = {} as TrpcUtils;
    const stores: Partial<AilaStores> = {};
    const getStore = buildStoreGetter(stores);

    stores.moderation = createModerationStore({
      id,
      getStore,
      trpcUtils,
      initialValues: parameters.moderationStoreState,
    });
    stores.chat = createChatStore(
      id,
      getStore,
      trpcUtils,
      parameters.chatStoreState,
    );
    stores.lessonPlan = createLessonPlanStore({
      id,
      getStore,
      trpcUtils,
      lessonPlanTracking: {} as unknown as LessonPlanTrackingContextProps,
      initialValues: parameters.lessonPlanStoreState,
    });

    return stores as AilaStores;
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
