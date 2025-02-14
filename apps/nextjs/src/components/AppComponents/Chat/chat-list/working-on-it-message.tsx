import {
  MessageTextWrapper,
  MessageWrapper,
} from "@/components/AppComponents/Chat/chat-message";
import { useChatStore } from "@/stores/AilaStoresProvider";

import { Separator } from ".";
import { MemoizedReactMarkdownWithStyles } from "../markdown";

export const WorkingOnItMessage = () => {
  const streamingMessage = useChatStore((state) => state.streamingMessage);
  const ailaStreamingStatus = useChatStore(
    (state) => state.ailaStreamingStatus,
  );

  const shouldShow =
    streamingMessage &&
    (streamingMessage.role === "user" ||
      !streamingMessage.parts.some((part) => part.document.type === "text"));

  const isFinishingUp =
    ailaStreamingStatus === "StreamingChatResponse" ||
    ailaStreamingStatus === "Moderating";
  const text = isFinishingUp ? "Finishing up…" : "Working on it…";

  if (shouldShow) {
    return (
      <>
        <Separator />

        {/* TODO: is is the right type? */}
        <MessageWrapper roleType="aila">
          <MessageTextWrapper>
            <div className="w-full animate-pulse">
              <MemoizedReactMarkdownWithStyles markdown={text} />
            </div>
          </MessageTextWrapper>
        </MessageWrapper>
      </>
    );
  }

  return null;
};
