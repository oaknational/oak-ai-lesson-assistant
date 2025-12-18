import { useEffect, useRef } from "react";
import Textarea from "react-textarea-autosize";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/AppComponents/Chat/ui/tooltip";
import { Icon } from "@/components/Icon";
import LoadingWheel from "@/components/LoadingWheel";
import { useClerkDemoMetadata } from "@/hooks/useClerkDemoMetadata";
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
  // Disable submission until Clerk metadata has loaded. This prevents race
  // conditions (particularly in E2E tests) where submitting before metadata
  // loads would incorrectly show the demo interstitial modal to non-demo users.
  const clerkMetadata = useClerkDemoMetadata();
  const isDisabled = isSubmitting || !clerkMetadata.isSet;

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
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden rounded-md border-2 border-black bg-white pr-20">
        <Textarea
          required
          data-testid="chat-input"
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"Subject, key stage and title"}
          spellCheck={false}
          className="min-h-[60px] w-full resize-none bg-transparent px-10 py-[1.3rem] text-lg focus-within:outline-none"
          disabled={isSubmitting}
        />
        <div className="absolute bottom-10 right-10 top-10 flex items-center justify-center">
          <Tooltip>
            <LoadingWheel visible={isSubmitting} />
            <TooltipTrigger asChild>
              <button
                data-testid="send-message"
                type="submit"
                className={`${isSubmitting ? "hidden" : "inline-block"} rounded-full bg-black p-4`}
                disabled={isDisabled}
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
