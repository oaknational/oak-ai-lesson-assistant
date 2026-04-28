import { useEffect, useRef, useState } from "react";

import { OakTertiaryButton } from "@oaknational/oak-components";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/AppComponents/Chat/ui/tooltip";
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit";
import { useChatStore } from "@/stores/AilaStoresProvider";
import type { ChatAction } from "@/stores/chatStore";
import { containsLink } from "@/utils/link-validation";

import FormValidationWarning from "../FormValidationWarning";

export interface PromptFormProps {
  input: string;
  setInput: (input: string) => void;
  onSubmit: (value: string) => void;
  hasMessages: boolean;
  isDisabled: boolean;
}

export function PromptForm({
  onSubmit,
  isDisabled,
  input,
  setInput,
  hasMessages,
}: Readonly<PromptFormProps>) {
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const queuedUserAction = useChatStore((state) => state.queuedUserAction);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    if (containsLink(newValue)) {
      setFormError("Aila doesn't currently support links");
    } else {
      setFormError(null);
    }
  };

  const isSubmitDisabled = isDisabled || formError !== null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!input?.trim()) {
      return;
    }
    if (formError) {
      return;
    }
    onSubmit(input);
  };

  return (
    <form onSubmit={handleSubmit} ref={formRef}>
      <div
        className={`${isDisabled ? "block" : "hidden"} h-[60px] w-full rounded-md border-2 border-oakGrey3 sm:hidden`}
      />
      <div
        className={`${isDisabled ? "hidden" : "flex"} relative max-h-60 w-full grow flex-col overflow-hidden rounded-md border-2 border-black bg-white pr-20 sm:flex`}
      >
        <textarea
          data-testid="chat-input"
          disabled={isDisabled}
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={input}
          onChange={handleInputChange}
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
              <OakTertiaryButton
                disabled={isSubmitDisabled}
                iconName="chevron-right"
                onClick={handleSubmit}
                data-testid="send-message"
              />
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
      {formError && (
        <FormValidationWarning
          errorMessage={formError}
          iconWidth="spacing-20"
          $font="body-3"
        />
      )}
    </form>
  );
}

function handlePlaceholder(
  hasMessages: boolean,
  queuedUserAction?: ChatAction,
) {
  if (queuedUserAction && queuedUserAction.type === "message") {
    return queuedUserAction.content;
  }
  return hasMessages
    ? "Type your response here"
    : "Type a subject, key stage and title";
}
