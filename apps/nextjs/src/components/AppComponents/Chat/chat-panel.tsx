import { useCallback } from "react";
import { toast } from "react-hot-toast";

import * as Sentry from "@sentry/nextjs";
import { cva } from "class-variance-authority";
import { useChatStore } from "src/stores/chatStore";

import { PromptForm } from "@/components/AppComponents/Chat/prompt-form";
import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import useAnalytics from "@/lib/analytics/useAnalytics";

import ChatPanelDisclaimer from "./chat-panel-disclaimer";

interface ChatPanelProps {
  isDemoLocked: boolean;
}

function LockedPromptForm() {
  return (
    <div className="h-25 w-full grow border-2 border-gray-300 sm:rounded-md"></div>
  );
}

export function ChatPanel({ isDemoLocked }: Readonly<ChatPanelProps>) {
  const chat = useLessonChat();
  const { id, messages, isLoading, input, setInput, append } = chat;

  const { queueUserAction, queuedUserAction, ailaStreamingStatus } =
    useChatStore();

  const hasMessages = !!messages.length;

  const { trackEvent } = useAnalytics();

  const handleSubmit = useCallback(
    (value: string) => {
      if (isLoading) return;
      trackEvent("chat:send_message", {
        id,
        message: value,
      });

      append({
        content: value,
        role: "user",
      }).catch((error) => {
        Sentry.captureException(error);
        toast.error("Failed to send message");
      });
    },
    [isLoading, trackEvent, id, append],
  );

  const containerClass = `grid w-full grid-cols-1 ${hasMessages ? "sm:grid-cols-1" : ""} peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]`;

  return (
    <div className={containerClass}>
      <div className={chatBoxWrap({ hasMessages })}>
        {!isDemoLocked && (
          <PromptForm
            onSubmit={handleSubmit}
            input={input}
            setInput={setInput}
            ailaStreamingStatus={ailaStreamingStatus}
            hasMessages={hasMessages}
            queueUserAction={queueUserAction}
            queuedUserAction={queuedUserAction}
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

const chatBoxWrap = cva(["mx-auto w-full"], {
  variants: {
    hasMessages: {
      false: "max-w-2xl",
      true: "",
    },
    readyToExport: {
      true: "flex",
      false: "hidden sm:flex",
    },
  },
});
