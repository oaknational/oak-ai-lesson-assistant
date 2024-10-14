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
        formRef.current?.requestSubmit();
      } catch (error) {
        console.error("Failed to submit form:", error);
      }
      event.preventDefault();
    }
  };

  return { formRef, onKeyDown: handleKeyDown };
}
