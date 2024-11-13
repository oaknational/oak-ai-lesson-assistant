import { OakFlex, OakSpan } from "@oaknational/oak-components";

import { OakLinkNoUnderline } from "@/components/OakLinkNoUnderline";

const ModalFooterButtons = ({
  closeDialog,
  actionButtonStates,
}: {
  closeDialog: () => void;
  actionButtonStates: () => JSX.Element;
}) => {
  return (
    <OakFlex
      $flexDirection="column"
      $width="100%"
      $justifyContent="center"
      $alignItems="center"
      $gap="all-spacing-3"
      $pb="inner-padding-m"
    >
      {actionButtonStates()}
      <OakLinkNoUnderline onClick={() => closeDialog()} element="button">
        <OakSpan $font="body-2-bold" $color="black" $textDecoration="none">
          Cancel
        </OakSpan>
      </OakLinkNoUnderline>
    </OakFlex>
  );
};

export default ModalFooterButtons;
