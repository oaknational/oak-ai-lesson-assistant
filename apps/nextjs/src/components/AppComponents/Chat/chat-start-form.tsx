import { useEffect, useRef, useState } from "react";
import Textarea from "react-textarea-autosize";

import { OakTertiaryButton } from "@oaknational/oak-components";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/AppComponents/Chat/ui/tooltip";
import { useClerkDemoMetadata } from "@/hooks/useClerkDemoMetadata";
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit";
import { containsLink } from "@/utils/link-validation";

import FormValidationWarning from "../FormValidationWarning";

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
  const [formError, setFormError] = useState<string | null>(null);
  // Disable submission until Clerk metadata has loaded. This prevents race
  // conditions (particularly in E2E tests) where submitting before metadata
  // loads would incorrectly show the demo interstitial modal to non-demo users.
  const clerkMetadata = useClerkDemoMetadata();
  const isDisabled = isSubmitting || !clerkMetadata.isSet || formError !== null;

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
    if (formError) {
      return;
    }
    submit(input);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    if (containsLink(newValue)) {
      setFormError("Aila doesn't currently support links");
    } else {
      setFormError(null);
    }
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
          onChange={handleInputChange}
          placeholder={"Subject, key stage and title"}
          spellCheck={false}
          className="min-h-[60px] w-full resize-none bg-transparent px-10 py-[1.3rem] text-lg focus-within:outline-none"
          disabled={isSubmitting}
        />
        <div className="absolute bottom-10 right-10 top-10 flex items-center justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <OakTertiaryButton
                disabled={isDisabled}
                iconName="chevron-right"
                isLoading={isSubmitting}
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
