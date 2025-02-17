import {
  MessageTextWrapper,
  MessageWrapper,
} from "@/components/AppComponents/Chat/chat-message";
import { useChatStore } from "@/stores/AilaStoresProvider";

import { MemoizedReactMarkdownWithStyles } from "../markdown";

export const WorkingOnItMessage = () => {
  const ailaStreamingStatus = useChatStore(
    (state) => state.ailaStreamingStatus,
  );

  const isFinishingUp = ailaStreamingStatus === "StreamingChatResponse";
  const text = isFinishingUp ? "Finishing up…" : "Working on it…";

  return (
    <MessageWrapper roleType="aila">
      <MessageTextWrapper>
        <div className="w-full animate-pulse">
          <MemoizedReactMarkdownWithStyles markdown={text} />
        </div>
      </MessageTextWrapper>
    </MessageWrapper>
  );
};
