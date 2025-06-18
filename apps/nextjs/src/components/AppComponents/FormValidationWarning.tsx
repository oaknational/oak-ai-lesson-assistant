import { OakFlex, OakIcon, OakP } from "@oaknational/oak-components";

const FormValidationWarning = ({ errorMessage }: { errorMessage: string }) => {
  return (
    <OakFlex $flexDirection="row" $gap="all-spacing-1" $alignItems="center">
      <OakIcon
        iconName="warning"
        iconWidth="all-spacing-8"
        $colorFilter="red"
      />
      <OakP $font="body-2" $color="icon-error">
        {errorMessage}
      </OakP>
    </OakFlex>
  );
};

export default FormValidationWarning;
