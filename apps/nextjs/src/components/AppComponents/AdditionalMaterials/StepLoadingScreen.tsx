import {
  OakBox,
  OakFlex,
  OakLoadingSpinner,
  OakP,
} from "@oaknational/oak-components";

const StepLoadingScreen = ({
  nameOfWhatIsBuilding,
}: {
  nameOfWhatIsBuilding: string;
}) => {
  return (
    <OakBox
      $position="absolute"
      $top="all-spacing-0"
      $left="all-spacing-0"
      $right="all-spacing-0"
      $bottom="all-spacing-0"
      $background="white"
    >
      <OakFlex
        $flexDirection="column"
        $alignItems="center"
        $justifyContent="center"
        $gap="all-spacing-6"
        $height="100%"
        $width="100%"
      >
        <OakP $font="heading-6">Building {nameOfWhatIsBuilding}</OakP>
        <OakLoadingSpinner $width="all-spacing-10" />
      </OakFlex>
    </OakBox>
  );
};

export default StepLoadingScreen;
