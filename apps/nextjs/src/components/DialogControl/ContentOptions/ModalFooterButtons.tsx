import { OakFlex, OakLink, OakSpan } from "@oaknational/oak-components";

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
      <OakLink onClick={() => closeDialog()}>
        <OakSpan $font="body-2-bold" $color="black" $textDecoration="none">
          Cancel
        </OakSpan>
      </OakLink>
    </OakFlex>
  );
};

export default ModalFooterButtons;
