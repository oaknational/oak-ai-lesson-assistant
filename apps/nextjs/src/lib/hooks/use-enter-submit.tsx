import { useRef, type RefObject } from "react";

export function useEnterSubmit(): {
  formRef: RefObject<HTMLFormElement>;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
} {
  const formRef = useRef<HTMLFormElement>(null);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      try {
        if (formRef.current?.requestSubmit) {
          formRef.current.requestSubmit();
        } else if (formRef.current?.submit) {
          formRef.current.submit();
        } else {
          throw new Error("Form submission not supported");
        }
      } catch (error) {
        console.error("Failed to submit form:", error);
      }
      event.preventDefault();
    }
  };

  return { formRef, onKeyDown: handleKeyDown };
}
