import "@/components/AppComponents/Chat/chat-message";
import { Message } from "@/components/AppComponents/Chat/chat-message/layout";
import { useTranslation } from "@/components/ContextProviders/LanguageContext";
import { useChatStore } from "@/stores/AilaStoresProvider";

import { MemoizedReactMarkdownWithStyles } from "../markdown";

export const WorkingOnItMessage = () => {
  const ailaStreamingStatus = useChatStore(
    (state) => state.ailaStreamingStatus,
  );
  const { t } = useTranslation();

  const isFinishingUp = ailaStreamingStatus === "StreamingChatResponse";
  const text = isFinishingUp ? t("chat.finishingUp") : t("chat.workingOnIt");

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
