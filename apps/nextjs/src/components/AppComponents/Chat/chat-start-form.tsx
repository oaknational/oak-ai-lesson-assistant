import { useEffect, useRef } from "react";
import Textarea from "react-textarea-autosize";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/AppComponents/Chat/ui/tooltip";
import { Icon } from "@/components/Icon";
import LoadingWheel from "@/components/LoadingWheel";
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit";

export function ChatStartForm({
  input,
  setInput,
  isSubmitting,
  submit,
}: Readonly<{
  input: string;
  setInput: (value: string) => void;
  isSubmitting: boolean;
  submit: (message: string) => void;
}>) {
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!input?.trim()) {
      return;
    }
    submit(input);
  };

  return (
    <form onSubmit={handleSubmit} ref={formRef}>
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden border-2 border-black bg-white pr-20 sm:rounded-md">
        <Textarea
          required
          data-testid="chat-input"
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"Type a subject, key stage and title"}
          spellCheck={false}
          className="min-h-[60px] w-full resize-none bg-transparent px-10 py-[1.3rem] focus-within:outline-none"
          disabled={isSubmitting}
        />
        <div className="absolute bottom-10 right-0 top-10 flex items-center justify-center sm:right-10">
          <Tooltip>
            <TooltipTrigger asChild>
              {isSubmitting ? (
                <LoadingWheel />
              ) : (
                <button
                  data-testid="send-message"
                  type="submit"
                  className="rounded-full bg-black p-4"
                  disabled={isSubmitting}
                >
                  <Icon icon="chevron-right" color="white" size="sm" />
                </button>
              )}
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  );
}
