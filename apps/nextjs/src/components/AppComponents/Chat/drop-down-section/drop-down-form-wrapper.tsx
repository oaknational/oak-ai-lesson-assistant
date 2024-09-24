import { useEffect, useRef } from "react";

import type { AilaUserFlagType, AilaUserModificationAction } from "@oakai/db";
import {
  OakBox,
  OakFlex,
  OakP,
  OakSmallPrimaryButton,
} from "@oaknational/oak-components";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";

export type FeedbackOption<T> = {
  label: string;
  enumValue: T;
};

export const DropDownFormWrapper = <
  T extends AilaUserModificationAction | AilaUserFlagType,
>({
  children,
  onClickActions,
  setIsOpen,
  selectedRadio,
  title,
  buttonText,
  isOpen,
  dropdownRef,
}: {
  children: React.ReactNode;
  onClickActions: (option: FeedbackOption<T>) => void;
  setIsOpen: (value: boolean) => void;
  selectedRadio: FeedbackOption<T> | null;
  title: string;
  buttonText: string;
  isOpen: boolean;
  dropdownRef: React.RefObject<HTMLDivElement>;
}) => {
  const { isStreaming } = useLessonChat();
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isOpen && firstButtonRef.current) {
      firstButtonRef.current.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (selectedRadio) {
          onClickActions(selectedRadio);
        }
        setIsOpen(false);
      }}
    >
      <OakFlex
        $ba="border-solid-m"
        $borderRadius="border-radius-m"
        $pa="inner-padding-l"
        $flexDirection="column"
        $position={["fixed", "absolute"]}
        $top={["all-spacing-7"]}
        $background="white"
        $width={["unset", "all-spacing-19", "all-spacing-21"]}
        $zIndex={100}
        $gap="space-between-m"
        $borderColor="border-neutral-lighter"
        $dropShadow="drop-shadow-standard"
      >
        <OakP $font="heading-6">{title}</OakP>
        {children}
        <OakBox>
          <OakSmallPrimaryButton disabled={isStreaming}>
            {buttonText}
          </OakSmallPrimaryButton>
        </OakBox>
      </OakFlex>
    </form>
  );
};

export default DropDownFormWrapper;
