import React, { useMemo } from "react";

import type { Decorator } from "@storybook/react";
import invariant from "tiny-invariant";
import { type ExtractState } from "zustand";

import type { LessonPlanTrackingContextProps } from "@/lib/analytics/lessonPlanTrackingContext";
import type { AilaStores } from "@/stores/AilaStoresProvider";
import {
  AilaStoresContext,
  buildStoreGetter,
} from "@/stores/AilaStoresProvider";
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
    const stores: Partial<AilaStores> = {};
    const getStore = buildStoreGetter(stores);

    stores.moderation = createModerationStore({
      id,
      getStore,
      trpcUtils,
      initialValues: parameters.moderationStoreState,
    });
    stores.chat = createChatStore(getStore, parameters.chatStoreState);
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
