import React, { useMemo } from "react";

import type { Decorator } from "@storybook/react";
import { fn } from "@storybook/test";

import type { TrackFns } from "@/components/ContextProviders/AnalyticsProvider";
import type { AilaStores } from "@/stores/AilaStoresProvider";
import {
  AilaStoresContext,
  buildStoreGetter,
} from "@/stores/AilaStoresProvider";
import { type ChatState, createChatStore } from "@/stores/chatStore";
import {
  type LessonPlanState,
  createLessonPlanStore,
} from "@/stores/lessonPlanStore";
import { createLessonPlanTrackingStore } from "@/stores/lessonPlanTrackingStore";
import {
  type ModerationState,
  createModerationStore,
} from "@/stores/moderationStore";
import { type TrpcUtils } from "@/utils/trpc";

declare module "@storybook/csf" {
  interface Parameters {
    moderationStoreState?: Partial<ModerationState>;
    chatStoreState?: Partial<ChatState>;
    lessonPlanStoreState?: Partial<LessonPlanState>;
  }
}

const trackEvents = {
  lessonPlanInitiated: fn(),
  lessonPlanRefined: fn(),
  lessonPlanCompleted: fn(),
  lessonPlanTerminated: fn(),
} as unknown as TrackFns;

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
      trpcUtils,
      initialValues: parameters.lessonPlanStoreState,
    });
    stores.lessonPlanTracking = createLessonPlanTrackingStore({
      id,
      getStore,
      track: trackEvents,
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
