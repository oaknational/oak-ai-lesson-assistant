import { useCallback, useEffect, useRef } from "react";

import type { UseChatHelpers } from "ai/react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/AppComponents/Chat/ui/tooltip";
import { Icon } from "@/components/Icon";
import { useLessonPlanTracking } from "@/lib/analytics/lessonPlanTrackingContext";
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit";
import { useSidebar } from "@/lib/hooks/use-sidebar";

import type { AilaStreamingStatus } from "./Chat/hooks/useAilaStreamingStatus";

export interface PromptFormProps
  extends Pick<UseChatHelpers, "input" | "setInput"> {
  onSubmit: (value: string) => void;
  hasMessages: boolean;
  ailaStreamingStatus: AilaStreamingStatus;
  queuedUserAction?: string | null;
  queueUserAction?: (action: string) => void;
}

export function PromptForm({
  ailaStreamingStatus,
  onSubmit,
  input,
  setInput,
  hasMessages,
  queuedUserAction,
  queueUserAction,
}: Readonly<PromptFormProps>) {
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lessonPlanTracking = useLessonPlanTracking();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const sidebar = useSidebar();

  const handleSubmit = useCallback(
    (value: string) => {
      setInput("");
      if (sidebar.isSidebarOpen) {
        sidebar.toggleSidebar();
      }

      lessonPlanTracking.onSubmitText(value);
      if (queueUserAction) {
        queueUserAction(value);
      } else {
        onSubmit(value);
      }
    },
    [lessonPlanTracking, queueUserAction, onSubmit, setInput, sidebar],
  );

  const shouldAllowUserInput =
    ["Idle", "Moderating"].includes(ailaStreamingStatus) && !queuedUserAction;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!input?.trim()) {
          return;
        }
        handleSubmit(input);
      }}
      ref={formRef}
    >
      <div
        className={`${!shouldAllowUserInput ? "block" : "hidden"} h-[60px] w-full rounded-md border-2 border-oakGrey3 sm:hidden`}
      />
      <div
        className={`${!shouldAllowUserInput ? "hidden" : "flex"} relative max-h-60 w-full grow flex-col overflow-hidden rounded-md border-2 border-black bg-white pr-20 sm:flex`}
      >
        <textarea
          data-testid="chat-input"
          disabled={!shouldAllowUserInput}
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={handlePlaceholder(
            hasMessages,
            queuedUserAction ?? undefined,
          )}
          spellCheck={false}
          className="min-h-[60px] w-full resize-none bg-transparent px-10 py-[1.3rem] text-base focus-within:outline-none"
        />
        <div className="absolute bottom-10 right-10 top-10 flex items-center justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                data-testid="send-message"
                type="submit"
                className={`rounded-full bg-black p-4 ${!shouldAllowUserInput ? "cursor-not-allowed opacity-50" : ""}`}
                disabled={!shouldAllowUserInput}
              >
                <Icon icon="chevron-right" color="white" size="sm" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  );
}

function handlePlaceholder(hasMessages: boolean, queuedUserAction?: string) {
  if (
    queuedUserAction &&
    !["continue", "regenerate"].includes(queuedUserAction)
  ) {
    return queuedUserAction;
  }
  return hasMessages
    ? "Type your response here"
    : "Type a subject, key stage and title";
}
