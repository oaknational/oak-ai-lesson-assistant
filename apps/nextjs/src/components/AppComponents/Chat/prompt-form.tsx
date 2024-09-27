import { useCallback, useEffect, useRef } from "react";
import Textarea from "react-textarea-autosize";

import { UseChatHelpers } from "ai/react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/AppComponents/Chat/ui/tooltip";
import { Icon } from "@/components/Icon";
import { useLessonPlanTracking } from "@/lib/analytics/lessonPlanTrackingContext";
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit";
import { useSidebar } from "@/lib/hooks/use-sidebar";

import { AilaStreamingStatus } from "./Chat/hooks/useAilaStreamingStatus";

export interface PromptFormProps
  extends Pick<UseChatHelpers, "input" | "setInput"> {
  onSubmit: (value: string) => void;
  isEmptyScreen: boolean;
  placeholder?: string;
  ailaStreamingStatus: AilaStreamingStatus;
  queuedUserAction?: string | null;
  queueUserAction?: (action: string) => void;
}

export function PromptForm({
  ailaStreamingStatus,
  onSubmit,
  input,
  setInput,
  isEmptyScreen,
  placeholder,
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
    async (value: string) => {
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
      onSubmit={async (e) => {
        e.preventDefault();
        if (!input?.trim()) {
          return;
        }
        handleSubmit(input);
      }}
      ref={formRef}
    >
      <div
        className={`${!shouldAllowUserInput ? "block" : "hidden"} h-[60px] w-full rounded-md  border-2 border-oakGrey3 sm:hidden`}
      />
      <div
        className={`${!shouldAllowUserInput ? "hidden" : "flex"} relative max-h-60 w-full grow flex-col overflow-hidden rounded-md border-2 border-black bg-white pr-20 sm:flex`}
      >
        <Textarea
          data-testid="chat-input"
          disabled={!shouldAllowUserInput}
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={handlePlaceholder(
            isEmptyScreen,
            queuedUserAction ?? placeholder,
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

function handlePlaceholder(isEmptyScreen: boolean, placeholder?: string) {
  if (placeholder) {
    return placeholder;
  }
  return !isEmptyScreen
    ? "Type a subject, key stage and title"
    : "Type your response here";
}
