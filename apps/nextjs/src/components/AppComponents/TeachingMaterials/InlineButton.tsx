import { forwardRef } from "react";

import { OakFlex, OakP } from "@oaknational/oak-components";

type InlineButtonProps = {
  onClick: () => void;
  children: string;
};

const InlineButton = forwardRef<HTMLButtonElement, InlineButtonProps>(
  ({ onClick, children }, ref) => {
    return (
      <OakFlex
        as="button"
        $ba="border-solid-s"
        $borderColor="grey50"
        $borderRadius="border-radius-m"
        $ph="spacing-8"
        $pv="spacing-4"
        $display="inline-flex"
        $alignSelf="flex-start"
        $width="fit-content"
        onClick={onClick}
        ref={ref}
      >
        <OakP $color="blue" $font="body-2">
          {children}
        </OakP>
      </OakFlex>
    );
  },
);

export default InlineButton;
