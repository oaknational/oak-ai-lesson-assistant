import { useState, createContext, useContext } from "react";

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

export const AilaStoresProvider = ({ children }) => {
  const [store] = useState(() => ({
    chat: createChatStore(),
    moderation: createModerationStore(),
  }));

  store.moderation.subscribe((state) => {
    if (state.toxicModeration) {
      console.log("moderation toxicModeration!!!!!!!!");
      store.chat.getState().setMessages([], false);
    }
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
