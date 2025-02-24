import { useState, useRef, createContext, useContext, useEffect } from "react";

import invariant from "tiny-invariant";
import { useStore, type StoreApi, type ExtractState } from "zustand";

import { useLessonPlanTracking } from "@/lib/analytics/lessonPlanTrackingContext";
import { type ChatStore, createChatStore } from "@/stores/chatStore";
import {
  type ModerationStore,
  createModerationStore,
} from "@/stores/moderationStore";
import { trpc } from "@/utils/trpc";

import { type LessonPlanStore, createLessonPlanStore } from "./lessonPlanStore";

export type AilaStores = {
  chat: StoreApi<ChatStore>;
  moderation: StoreApi<ModerationStore>;
  lessonPlan: StoreApi<LessonPlanStore>;
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
    void stores.chat.getState().fetchInitialMessages();
    void stores.lessonPlan.getState().refetch();
    void stores.moderation.getState().fetchModerations();
    haveInitialized.current = true;
  }, [stores.lessonPlan, id, stores.moderation, stores.chat]);

  return (
    <AilaStoresContext.Provider value={stores}>
      {children}
    </AilaStoresContext.Provider>
  );
};

export const useChatStore = <T,>(selector: (store: ChatStore) => T) => {
  const context = useContext(AilaStoresContext);
  if (!context) {
    throw new Error("Missing AilaStoresProvider");
  }
  return useStore(context.chat, selector);
};

export const useModerationStore = <T,>(
  selector: (store: ModerationStore) => T,
) => {
  const context = useContext(AilaStoresContext);
  if (!context) {
    throw new Error("Missing AilaStoresProvider");
  }
  return useStore(context.moderation, selector);
};

export const useLessonPlanStore = <T,>(
  selector: (store: LessonPlanStore) => T,
) => {
  const context = useContext(AilaStoresContext);
  if (!context) {
    throw new Error("Missing AilaStoresProvider");
  }
  return useStore(context.lessonPlan, selector);
};
