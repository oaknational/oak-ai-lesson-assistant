import type { ReactNode } from "react";
import { useMemo, createContext, useContext } from "react";

import { useModerationModal } from "../AppComponents/FeedbackForms/ModerationFeedbackModal";

export interface ChatModerationContextProps {
  moderationModalHelpers: ReturnType<typeof useModerationModal>;
}

const ChatModerationContext = createContext<
  ChatModerationContextProps | undefined
>(undefined);

export type ChatModerationProviderProps = Readonly<{
  chatId: string;
  children: ReactNode;
}>;
export const ChatModerationProvider = ({
  chatId,
  children,
}: ChatModerationProviderProps) => {
  const moderationModalHelpers = useModerationModal({ chatId });
  const value = useMemo(
    () => ({ moderationModalHelpers }),
    [moderationModalHelpers],
  );

  return (
    <ChatModerationContext.Provider value={value}>
      {children}
    </ChatModerationContext.Provider>
  );
};

export const useChatModeration = () => {
  const context = useContext(ChatModerationContext);
  if (!context) {
    throw new Error(
      "useChatModeration must be used within a ChatModerationProvider",
    );
  }
  return context;
};
