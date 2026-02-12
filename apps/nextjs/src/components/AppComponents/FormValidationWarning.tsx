import { OakFlex, OakIcon, OakP } from "@oaknational/oak-components";

const FormValidationWarning = ({ errorMessage }: { errorMessage: string }) => {
  return (
    <OakFlex $flexDirection="row" $gap="spacing-4" $alignItems="center">
      <OakIcon
        iconName="warning"
        iconWidth="spacing-40"
        $colorFilter="icon-error"
      />
      <OakP $font="body-2" $color="icon-error">
        {errorMessage}
      </OakP>
    </OakFlex>
  );
};

export default FormValidationWarning;
