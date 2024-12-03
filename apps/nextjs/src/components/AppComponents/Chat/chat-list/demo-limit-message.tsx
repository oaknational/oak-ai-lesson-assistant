"use client";

import { ChatMessage } from "@/components/AppComponents/Chat/chat-message";

export function DemoLimitMessage({ id }: Readonly<{ id: string }>) {
  return (
    <div className="w-full flex-col gap-11">
      <ChatMessage
        chatId={id}
        ailaStreamingStatus="Idle"
        message={{
          id: "demo-limit",
          role: "assistant",
          content:
            '{"type": "error", "message": "**Your lesson is complete**\\nYou can no longer edit this lesson. [Create new lesson.](/aila)"}',
        }}
        persistedModerations={[]}
        separator={<span className="my-10 flex" />}
      />
    </div>
  );
}
