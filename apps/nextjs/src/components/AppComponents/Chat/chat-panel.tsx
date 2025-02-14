import { useCallback } from "react";

import { cva } from "class-variance-authority";

import { PromptForm } from "@/components/AppComponents/Chat/prompt-form";
import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { useLessonPlanTracking } from "@/lib/analytics/lessonPlanTrackingContext";
import useAnalytics from "@/lib/analytics/useAnalytics";
import { useSidebar } from "@/lib/hooks/use-sidebar";
import { useChatStore, useLessonPlanStore } from "@/stores/AilaStoresProvider";
import { canAppendSelector } from "@/stores/chatStore/selectors";

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
  const { messages } = chat;
  const input = useChatStore((state) => state.input);
  const setInput = useChatStore((state) => state.setInput);
  const id = useLessonPlanStore((state) => state.id);

  const append = useChatStore((state) => state.append);
  const shouldAllowUserInput = useChatStore(canAppendSelector);

  const hasMessages = !!messages.length;

  const { trackEvent } = useAnalytics();

  const sidebar = useSidebar();
  const lessonPlanTracking = useLessonPlanTracking();

  const handleSubmit = useCallback(
    (value: string) => {
      setInput("");
      if (sidebar.isSidebarOpen) {
        sidebar.toggleSidebar();
      }

      lessonPlanTracking.onSubmitText(value);

      trackEvent("chat:send_message", { id, message: value });

      append(value);
    },
    [lessonPlanTracking, setInput, sidebar, trackEvent, id, append],
  );

  const containerClass = `grid w-full grid-cols-1 ${hasMessages ? "sm:grid-cols-1" : ""} peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]`;

  return (
    <div className={containerClass}>
      <div className={chatBoxWrap({ hasMessages })}>
        {!isDemoLocked && (
          <PromptForm
            onSubmit={handleSubmit}
            isDisabled={!shouldAllowUserInput}
            input={input}
            setInput={setInput}
            hasMessages={hasMessages}
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
