import type { JSX } from "react";

import { OakFlex, OakSpan } from "@oaknational/oak-components";

import { OakLinkNoUnderline } from "@/components/OakLinkNoUnderline";

export type ModalFooterButtonsProps = Readonly<{
  closeDialog: () => void;
  actionButtonStates: () => JSX.Element;
}>;
const ModalFooterButtons = ({
  closeDialog,
  actionButtonStates,
}: ModalFooterButtonsProps) => {
  return (
    <OakFlex
      $flexDirection="column"
      $width="100%"
      $justifyContent="center"
      $alignItems="center"
      $gap="spacing-12"
      $pb="spacing-16"
    >
      {actionButtonStates()}
      <OakLinkNoUnderline
        onClick={() => closeDialog()}
        element="button"
        tabIndex={1}
      >
        <OakSpan $font="body-2-bold" $color="text-primary" $textDecoration="none">
          Cancel
        </OakSpan>
      </OakLinkNoUnderline>
    </OakFlex>
  );
};

export default ModalFooterButtons;
