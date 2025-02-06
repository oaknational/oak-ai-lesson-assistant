import { useState, createContext, useContext } from "react";

import { useStore, type StoreApi } from "zustand";

import { type ChatStore, createChatStore } from "@/stores/chatStore";
import {
  type ModerationStore,
  createModerationStore,
} from "@/stores/moderationStore";
import { trpc } from "@/utils/trpc";

import { type LessonPlanStore, createLessonPlanStore } from "./lessonPlanStore";

type AilaStoresContextProps = {
  chat: StoreApi<ChatStore>;
  moderation: StoreApi<ModerationStore>;
  lessonPlan: StoreApi<LessonPlanStore>;
};

export const AilaStoresContext = createContext<
  AilaStoresContextProps | undefined
>(undefined);

export interface AilaStoresProviderProps {
  children: React.ReactNode;
  id: string;
}

export const AilaStoresProvider: React.FC<AilaStoresProviderProps> = ({
  children,
  id,
}) => {
  const trpcUtils = trpc.useUtils();

  const [store] = useState(() => {
    const moderationStore = createModerationStore({
      id,
      trpcUtils,
    });
    const chatStore = createChatStore();

    moderationStore.setState((state) => ({
      ...state,
      chatActions: chatStore.getState(),
    }));

    chatStore.setState((state) => ({
      ...state,
      moderationActions: moderationStore.getState(),
    }));

    return {
      chat: chatStore,
      moderation: moderationStore,
      lessonPlan: createLessonPlanStore(),
    };
  });

  return (
    <AilaStoresContext.Provider value={store}>
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
