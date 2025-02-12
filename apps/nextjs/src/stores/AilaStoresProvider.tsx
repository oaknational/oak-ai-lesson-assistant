import { useState, createContext, useContext, useEffect } from "react";

import { useStore, type StoreApi } from "zustand";

import { type ChatStore, createChatStore } from "@/stores/chatStore";
import { trpc } from "@/utils/trpc";

import { type LessonPlanStore, createLessonPlanStore } from "./lessonPlanStore";

type AilaStoresContextProps = {
  chat: StoreApi<ChatStore>;
  lessonPlan: StoreApi<LessonPlanStore>;
};

export const AilaStoresContext = createContext<
  AilaStoresContextProps | undefined
>(undefined);

type AilaStoresProviderProps = {
  id: string;
  children: React.ReactNode;
};

export const AilaStoresProvider = ({
  id,
  children,
}: AilaStoresProviderProps) => {
  const trpcUtils = trpc.useUtils();

  const [stores] = useState(() => ({
    chat: createChatStore(),
    lessonPlan: createLessonPlanStore(id, trpcUtils),
  }));

  // Store initialisation
  useEffect(() => {
    void stores.lessonPlan.getState().refetch();
  }, [stores.lessonPlan, id]);

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

export const useLessonPlanStore = <T,>(
  selector: (store: LessonPlanStore) => T,
) => {
  const context = useContext(AilaStoresContext);
  if (!context) {
    throw new Error("Missing AilaStoresProvider");
  }
  return useStore(context.lessonPlan, selector);
};
