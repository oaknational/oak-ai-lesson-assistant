"use client";

import { useChatStore } from "@/stores/AilaStoresProvider";

export function StreamingStatusTestHook() {
  const ailaStreamingStatus = useChatStore(
    (state) => state.ailaStreamingStatus,
  );

  return (
    <span data-testid="chat-aila-streaming-status" className="sr-only">
      {ailaStreamingStatus}
    </span>
  );
}
