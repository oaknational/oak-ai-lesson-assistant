import { cva } from "class-variance-authority";

import { ButtonScrollToBottom } from "@/components/AppComponents/Chat/button-scroll-to-bottom";
import { PromptForm } from "@/components/AppComponents/Chat/prompt-form";
import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import useAnalytics from "@/lib/analytics/useAnalytics";

import ChatPanelDisclaimer from "./chat-panel-disclaimer";

interface ChatPanelProps {
  isEmptyScreen: boolean;
  isDemoLocked: boolean;
}

function LockedPromptForm() {
  return (
    <div className="h-25 w-full grow border-2 border-gray-300 sm:rounded-md"></div>
  );
}

export function ChatPanel({
  isEmptyScreen,
  isDemoLocked,
}: Readonly<ChatPanelProps>) {
  const chat = useLessonChat();
  const { id, isLoading, input, setInput, append, ailaStreamingStatus } = chat;

  const { trackEvent } = useAnalytics();
  const containerClass = `grid w-full grid-cols-1 ${isEmptyScreen ? "sm:grid-cols-1" : ""} peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]`;
  return (
    <div className={containerClass}>
      <ButtonScrollToBottom />
      <div className={chatBoxWrap({ isEmptyScreen })}>
        {!isDemoLocked && (
          <PromptForm
            onSubmit={async (value) => {
              if (isLoading) return;
              trackEvent("chat:send_message", {
                id,
                message: value,
              });

              await append({
                content: value,
                role: "user",
              });
            }}
            input={input}
            setInput={setInput}
            ailaStreamingStatus={ailaStreamingStatus}
            isEmptyScreen={isEmptyScreen}
          />
        )}
        {isDemoLocked && <LockedPromptForm />}
        <span className="hidden w-full sm:block">
          <ChatPanelDisclaimer size="sm" />
        </span>
      </div>
    </div>
  );
}

const chatBoxWrap = cva(["mx-auto w-full  "], {
  variants: {
    isEmptyScreen: {
      false: "max-w-2xl ",
      true: "",
    },
    readyToExport: {
      true: "flex",
      false: "hidden sm:flex",
    },
  },
});
