import { useEffect, useRef } from "react";

import {
  OakBox,
  OakFlex,
  OakP,
  OakSmallPrimaryButton,
} from "@oaknational/oak-components";

export const DropDownFormWrapper = ({
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
  onClickActions: (option: string) => void;
  setIsOpen: (value: boolean) => void;
  selectedRadio: string | null;
  title: string;
  buttonText: string;
  isOpen: boolean;
  dropdownRef: React.RefObject<HTMLDivElement>;
}) => {
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
        $position="absolute"
        $top="all-spacing-7"
        $background="white"
        $width="all-spacing-21"
        $zIndex={100}
        $gap="space-between-m"
        $borderColor="border-neutral-lighter"
        $dropShadow="drop-shadow-standard"
      >
        <OakP $font="heading-6">{title}</OakP>
        {children}
        <OakBox>
          <OakSmallPrimaryButton>{buttonText}</OakSmallPrimaryButton>
        </OakBox>
      </OakFlex>
    </form>
  );
};

export default DropDownFormWrapper;
