import React from "react";

import {
  ChatModerationProvider,
  useChatModeration,
} from "@/components/ContextProviders/ChatModerationContext";
import {
  useChatLessonPlan,
  useChatModerations,
} from "@/components/ContextProviders/ChatProvider";

import ModerationFeedbackModal from "../../FeedbackForms/ModerationFeedbackModal";
import { ChatModerationDisplay } from "./ChatModerationDisplay";

interface ChatModerationProps {
  children: React.ReactNode;
}

const ChatModeration = ({ children }: ChatModerationProps) => {
  const { id } = useChatLessonPlan();
  const { toxicModeration } = useChatModerations();

  if (toxicModeration) {
    if (!id) throw new Error("Toxic moderation, but no chat id");
    return <ChatModerationDisplay toxicModeration={toxicModeration} />;
  }

  return (
    <ChatModerationProvider>
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
