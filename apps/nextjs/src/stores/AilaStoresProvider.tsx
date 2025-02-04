import { useState, createContext, useContext } from "react";

import { useStore, type StoreApi } from "zustand";

import { type ChatStore, createChatStore } from "@/stores/chatStore";

type AilaStoresContextProps = {
  chat: StoreApi<ChatStore>;
};

export const AilaStoresContext = createContext<
  AilaStoresContextProps | undefined
>(undefined);

export const AilaStoresProvider = ({ children }) => {
  const [store] = useState(() => ({
    chat: createChatStore(),
  }));

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
