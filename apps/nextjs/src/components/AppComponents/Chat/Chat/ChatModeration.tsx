import React from "react";

import { useModerationStore } from "@/stores/AilaStoresProvider";

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

  return <>{children}</>;
};

export default ChatModeration;
