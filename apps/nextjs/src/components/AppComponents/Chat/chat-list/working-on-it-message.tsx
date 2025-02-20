import "@/components/AppComponents/Chat/chat-message";
import { Message } from "@/components/AppComponents/Chat/chat-message/layout";
import { useChatStore } from "@/stores/AilaStoresProvider";

import { MemoizedReactMarkdownWithStyles } from "../markdown";

export const WorkingOnItMessage = () => {
  const ailaStreamingStatus = useChatStore(
    (state) => state.ailaStreamingStatus,
  );

  const isFinishingUp = ailaStreamingStatus === "StreamingChatResponse";
  const text = isFinishingUp ? "Finishing up…" : "Working on it…";

  return (
    <Message.Container roleType="aila">
      <Message.Content>
        <div className="w-full animate-pulse">
          <MemoizedReactMarkdownWithStyles markdown={text} />
        </div>
      </Message.Content>
    </Message.Container>
  );
};
