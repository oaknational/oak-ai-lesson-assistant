import {
  type OakAllSpacingToken,
  type OakBoxProps,
  OakFlex,
  type OakFontToken,
  OakIcon,
  OakSpan,
} from "@oaknational/oak-components";

type FormValidationWarningProps = {
  errorMessage: string;
  iconWidth?: OakAllSpacingToken;
  $font?: OakFontToken;
  $gap?: OakAllSpacingToken;
  $mt?: OakBoxProps["$mt"];
};

const FormValidationWarning = ({
  errorMessage,
  iconWidth = "spacing-40",
  $font = "body-2",
  $gap = "spacing-4",
  $mt,
}: FormValidationWarningProps) => {
  return (
    <OakFlex $flexDirection="row" $gap={$gap} $alignItems="center" $mt={$mt}>
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
