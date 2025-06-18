import { OakFlex, OakP } from "@oaknational/oak-components";

type InlineButtonProps = {
  onClick: () => void;
  children: string;
};

const InlineButton = ({ onClick, children }: Readonly<InlineButtonProps>) => {
  return (
    <OakFlex
      as="button"
      $ba="border-solid-s"
      $borderColor="grey50"
      $borderRadius="border-radius-m"
      $ph="inner-padding-xs"
      $pv="inner-padding-ssx"
      $display="inline-flex"
      $alignSelf="flex-start"
      $width="fit-content"
      onClick={onClick}
    >
      <OakP $color="blue" $font="body-2">
        {children}
      </OakP>
    </OakFlex>
  );
};

export default InlineButton;
