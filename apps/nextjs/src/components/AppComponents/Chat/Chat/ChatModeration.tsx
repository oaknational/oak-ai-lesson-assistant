import React from "react";

import {
  ChatModerationProvider,
  useChatModeration,
} from "@/components/ContextProviders/ChatModerationContext";
import { useLessonChat } from "@/components/ContextProviders/ChatProvider";

import ModerationFeedbackModal from "../../FeedbackForms/ModerationFeedbackModal";
import { ChatModerationDisplay } from "./ChatModerationDisplay";

interface ChatModerationProps {
  children: React.ReactNode;
}

const ChatModeration = ({ children }: ChatModerationProps) => {
  const chat = useLessonChat();

  const { id, toxicModeration } = chat;

  if (toxicModeration) {
    if (!id) throw new Error("Toxic moderation, but no chat id");
    return (
      <ChatModerationDisplay toxicModeration={toxicModeration} chatId={id} />
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
