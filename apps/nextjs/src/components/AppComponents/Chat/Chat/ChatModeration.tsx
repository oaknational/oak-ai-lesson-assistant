import React from "react";

import { useModerationStore } from "@/stores/AilaStoresProvider";

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

  return <>{children}</>;
};

export default ChatModeration;
