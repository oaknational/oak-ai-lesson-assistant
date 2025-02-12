import React from "react";

import {
  ChatModerationProvider,
  useChatModeration,
} from "@/components/ContextProviders/ChatModerationContext";
import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { useModerationStore } from "@/stores/AilaStoresProvider";

import ModerationFeedbackModal from "../../FeedbackForms/ModerationFeedbackModal";
import { ChatModerationDisplay } from "./ChatModerationDisplay";

export type ChatModerationProps = Readonly<{
  children: React.ReactNode;
}>;

const ChatModeration = ({ children }: ChatModerationProps) => {
  const id = useModerationStore((state) => state.id);
  const toxicModeration = useModerationStore((state) => state.toxicModeration);

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
