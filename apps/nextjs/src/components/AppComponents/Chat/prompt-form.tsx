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
      <div
        className={`${isLoading ? "block" : "hidden"} h-[60px] w-full rounded-md  border-2 border-oakGrey3 sm:hidden`}
      />
      <div
        className={`${isLoading ? "hidden" : "flex"} relative max-h-60 w-full grow flex-col overflow-hidden rounded-md border-2 border-black bg-white pr-20 sm:flex`}
      >
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
          className="min-h-[60px] w-full resize-none bg-transparent px-10 py-[1.3rem] text-base focus-within:outline-none"
        />
        <div className="absolute bottom-10 right-10 top-10 flex items-center justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                data-testid="send-message"
                type="submit"
                className="rounded-full bg-black p-4"
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
