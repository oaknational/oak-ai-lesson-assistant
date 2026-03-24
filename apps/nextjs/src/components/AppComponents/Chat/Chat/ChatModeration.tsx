import React from "react";

import { useRouter } from "next/navigation";

import { useModerationStore } from "@/stores/AilaStoresProvider";

import { ToxicContentModal } from "../toxic-content-modal";

export type ChatModerationProps = Readonly<{
  children: React.ReactNode;
}>;

const ChatModeration = ({ children }: ChatModerationProps) => {
  const id = useModerationStore((state) => state.id);
  const toxicModeration = useModerationStore((state) => state.toxicModeration);
  const router = useRouter();
  if (toxicModeration) {
    if (!id) throw new Error("Toxic moderation, but no chat id");
    return (
      <ToxicContentModal
        chatId={id}
        moderation={toxicModeration}
        open={true}
        onClose={() => router.push("/aila")}
      />
    );
  }

  return <>{children}</>;
};

export default ChatModeration;
