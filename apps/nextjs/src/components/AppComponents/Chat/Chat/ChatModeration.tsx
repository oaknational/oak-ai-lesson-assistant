import React from "react";

import { useRouter } from "next/navigation";

import { useModerationStore } from "@/stores/AilaStoresProvider";

import { ToxicContentModal } from "../toxic-content-modal";

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
