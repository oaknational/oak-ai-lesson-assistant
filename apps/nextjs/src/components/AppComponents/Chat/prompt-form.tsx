import * as React from "react";
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

interface PromptProps extends Pick<UseChatHelpers, "input" | "setInput"> {
  onSubmit: (value: string) => void;
  isLoading: boolean;
  isEmptyScreen: boolean;
  placeholder?: string;
}

export function PromptForm({
  onSubmit,
  input,
  setInput,
  isLoading,
  isEmptyScreen,
  placeholder,
}: Readonly<PromptProps>) {
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const lessonPlanTracking = useLessonPlanTracking();

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  const sidebar = useSidebar();
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (isLoading) {
          return;
        }
        if (!input?.trim()) {
          return;
        }
        setInput("");
        if (sidebar.isSidebarOpen) {
          sidebar.toggleSidebar();
        }

        lessonPlanTracking.onSubmitText(input);
        onSubmit(input);
      }}
      ref={formRef}
    >
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden border-2 border-black bg-white pr-20 sm:rounded-md">
        <Textarea
          data-testid="chat-input"
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={handlePlaceholder(isEmptyScreen, placeholder)}
          spellCheck={false}
          className="min-h-[60px] w-full resize-none bg-transparent px-10 py-[1.3rem] focus-within:outline-none"
        />
        <div className="absolute bottom-10 right-0 top-10 flex items-center justify-center sm:right-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                data-testid="send-message"
                type="submit"
                className={`rounded-full bg-black p-4 ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
                disabled={isLoading}
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
