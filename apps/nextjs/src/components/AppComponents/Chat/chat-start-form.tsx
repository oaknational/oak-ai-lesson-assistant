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
  initialPrompt,
  userCanSubmit,
  setValidationError,
  selectedSubject,
  selectedKeyStage,
  selectedLength,
}: Readonly<{
  input: string;
  setInput: (value: string) => void;
  isSubmitting: boolean;
  submit: (message: string) => void;
  initialPrompt: string | null;
  userCanSubmit: boolean;
  setValidationError: (message: string | null) => void;
  selectedSubject: string | null;
  selectedKeyStage: string | null;
  selectedLength: string | null;
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
    if (!userCanSubmit) {
      setValidationError(
        `The following field(s) are missing: ${
          !selectedSubject ? "Subject" : ""
        }${!selectedKeyStage ? ", Key Stage" : ""}${
          !selectedLength ? ", Length" : ""
        }${!input ? ", Lesson Title" : ""}`,
      );
      return;
    }
    if (!initialPrompt?.trim()) {
      return;
    }
    submit(initialPrompt);
  };

  return (
    <form onSubmit={handleSubmit} ref={formRef}>
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden rounded-full border-2 border-black bg-white pr-20">
        <Textarea
          required
          data-testid="chat-input"
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"Type a lesson title"}
          spellCheck={false}
          className="min-h-[60px] w-full resize-none bg-transparent px-10 py-[1.3rem] text-lg focus-within:outline-none"
          disabled={isSubmitting}
        />
        <div className="absolute bottom-10 right-10 top-10 flex items-center justify-center ">
          <Tooltip>
            <LoadingWheel visible={isSubmitting} />
            <TooltipTrigger asChild>
              <button
                data-testid="send-message"
                type="submit"
                className={`${isSubmitting ? "hidden" : "inline-block"} rounded-full bg-black p-4`}
                disabled={isSubmitting}
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
