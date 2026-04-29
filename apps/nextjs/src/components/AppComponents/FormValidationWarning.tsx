import {
  type OakAllSpacingToken,
  OakFlex,
  type OakFlexProps,
  type OakFontToken,
  OakIcon,
  OakSpan,
} from "@oaknational/oak-components";

type FormValidationWarningProps = {
  errorMessage: string;
  iconWidth?: OakAllSpacingToken;
  $font?: OakFontToken;
  containerProps?: OakFlexProps;
};

const FormValidationWarning = ({
  errorMessage,
  iconWidth = "spacing-40",
  $font = "body-2",
  containerProps,
}: FormValidationWarningProps) => {
  return (
    <OakFlex
      $flexDirection="row"
      $gap="spacing-4"
      $alignItems="center"
      {...containerProps}
    >
      <OakIcon
        iconName="warning"
        iconWidth={iconWidth}
        $colorFilter="icon-error"
      />
      <OakSpan $font={$font} $color="text-error">
        {errorMessage}
      </OakSpan>
    </OakFlex>
  );
};

export default FormValidationWarning;
