import {
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
} from "react";

import { useStore, type StoreApi } from "zustand";

import { type ChatStore, createChatStore } from "@/stores/chatStore";
import {
  type ModerationStore,
  createModerationStore,
} from "@/stores/moderationStore";

type AilaStoresContextProps = {
  chat: StoreApi<ChatStore>;
  moderation: StoreApi<ModerationStore>;
};

export const AilaStoresContext = createContext<
  AilaStoresContextProps | undefined
>(undefined);

export interface AilaStoresProviderProps {
  children: React.ReactNode;
  id: string | null;
}

export const AilaStoresProvider: React.FC<AilaStoresProviderProps> = ({
  children,
  id,
}) => {
  const [store] = useState(() => {
    const moderationStore = createModerationStore(id);
    const chatStore = createChatStore(id);

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
