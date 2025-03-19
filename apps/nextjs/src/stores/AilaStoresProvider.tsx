import { createContext, useContext, useEffect, useRef, useState } from "react";

import invariant from "tiny-invariant";
import { type ExtractState, type StoreApi, useStore } from "zustand";

import { useLessonPlanTracking } from "@/lib/analytics/lessonPlanTrackingContext";
import { createChatStore } from "@/stores/chatStore";
import type { ChatState } from "@/stores/chatStore/types";
import {
  type ModerationState,
  createModerationStore,
} from "@/stores/moderationStore";
import { trpc } from "@/utils/trpc";

import { type LessonPlanState, createLessonPlanStore } from "./lessonPlanStore";

export type AilaStores = {
  chat: StoreApi<ChatState>;
  moderation: StoreApi<ModerationState>;
  lessonPlan: StoreApi<LessonPlanState>;
};
export type GetStore = <T extends keyof AilaStores>(
  storeName: T,
) => ExtractState<AilaStores[T]>;

export const AilaStoresContext = createContext<AilaStores | undefined>(
  undefined,
);

export interface AilaStoresProviderProps {
  children: React.ReactNode;
  id: string;
}

export const buildStoreGetter =
  (stores: Partial<AilaStores>) =>
  <T extends keyof AilaStores>(storeName: T) => {
    invariant(stores[storeName], `Store ${storeName} not initialised`);
    return stores[storeName].getState() as ExtractState<AilaStores[T]>;
  };

export const AilaStoresProvider: React.FC<AilaStoresProviderProps> = ({
  children,
  id,
}) => {
  const trpcUtils = trpc.useUtils();
  const lessonPlanTracking = useLessonPlanTracking();

  const [stores] = useState(() => {
    const stores: Partial<AilaStores> = {};
    const getStore = buildStoreGetter(stores);

    stores.moderation = createModerationStore({
      id,
      trpcUtils,
      getStore,
    });
    stores.chat = createChatStore(id, getStore, trpcUtils);
    stores.lessonPlan = createLessonPlanStore({
      id,
      trpcUtils,
      lessonPlanTracking,
      getStore,
    });

    return stores as AilaStores;
  });

  // Store initialisation
  const haveInitialized = useRef(false);
  useEffect(() => {
    // work around react strict mode double rendering
    if (haveInitialized.current) {
      return;
    }
    void stores.chat.getState().actions.fetchInitialMessages();
    void stores.lessonPlan.getState().actions.refetch();
    void stores.moderation.getState().actions.fetchModerations();
    haveInitialized.current = true;
  }, [stores.lessonPlan, id, stores.moderation, stores.chat]);

  useEffect(() => {
    const unsubscribe = stores.chat.subscribe((state, prevState) => {
      const streamingStatus = state.ailaStreamingStatus;
      if (streamingStatus !== prevState.ailaStreamingStatus) {
        stores.chat
          .getState()
          .actions.ailaStreamingStatusUpdated(streamingStatus);
        stores.moderation
          .getState()
          .actions.ailaStreamingStatusUpdated(streamingStatus);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [stores.chat, stores.moderation]);

  return (
    <AilaStoresContext.Provider value={stores}>
      {children}
    </AilaStoresContext.Provider>
  );
};

export const useChatStore = <T,>(selector: (store: ChatState) => T) => {
  const context = useContext(AilaStoresContext);
  if (!context) {
    throw new Error("Missing AilaStoresProvider");
  }
  return useStore(context.chat, selector);
};

// Actions are stable so we can bundle them up to be easier to use
export const useChatActions = () => {
  const context = useContext(AilaStoresContext);
  if (!context) {
    throw new Error("Missing AilaStoresProvider");
  }
  return useStore(context.chat, (state) => state.actions);
};

export const useModerationStore = <T,>(
  selector: (store: ModerationState) => T,
) => {
  const context = useContext(AilaStoresContext);
  if (!context) {
    throw new Error("Missing AilaStoresProvider");
  }
  return useStore(context.moderation, selector);
};

// Actions are stable so we can bundle them up to be easier to use
export const useModerationActions = () => {
  const context = useContext(AilaStoresContext);
  if (!context) {
    throw new Error("Missing AilaStoresProvider");
  }
  return useStore(context.moderation, (state) => state.actions);
};

export const useLessonPlanStore = <T,>(
  selector: (store: LessonPlanState) => T,
) => {
  const context = useContext(AilaStoresContext);
  if (!context) {
    throw new Error("Missing AilaStoresProvider");
  }
  return useStore(context.lessonPlan, selector);
};

// Actions are stable so we can bundle them up to be easier to use
export const useLessonPlanActions = () => {
  const context = useContext(AilaStoresContext);
  if (!context) {
    throw new Error("Missing AilaStoresProvider");
  }
  return useStore(context.lessonPlan, (state) => state.actions);
};
