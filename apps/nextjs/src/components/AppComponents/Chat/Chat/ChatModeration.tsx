import React from "react";

import {
  ChatModerationProvider,
  useChatModeration,
} from "@/components/ContextProviders/ChatModerationContext";
import { useModerationStore } from "@/stores/AilaStoresProvider";

import ModerationFeedbackModal from "../../FeedbackForms/ModerationFeedbackModal";
import { ChatModerationDisplay } from "./ChatModerationDisplay";

export type ChatModerationProps = Readonly<{
  children: React.ReactNode;
}>;

const ChatModeration = ({ children }: ChatModerationProps) => {
  const id = useModerationStore((state) => state.id);
  const lockingModeration = useModerationStore(
    (state) => state.lockingModeration,
  );

  if (lockingModeration) {
    if (!id) throw new Error("Locking moderation, but no chat id");
    return (
      <ChatModerationDisplay
        lockingModeration={lockingModeration}
        chatId={id}
      />
    );
  }

  return (
    <ChatModerationProvider chatId={id}>
      <ChatModerationContentWithModal>
        {children}
      </ChatModerationContentWithModal>
    </ChatModerationProvider>
  );
};

const ChatModerationContentWithModal = ({ children }: ChatModerationProps) => {
  const { moderationModalHelpers } = useChatModeration();

  return (
    <>
      <ModerationFeedbackModal
        moderationFeedbackFormProps={
          moderationModalHelpers.moderationFeedbackFormProps
        }
      />
      {children}
    </>
  );
};

export default ChatModeration;
