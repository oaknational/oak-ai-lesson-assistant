import { OakFlex, OakLoadingSpinner, OakP } from "@oaknational/oak-components";

const StepLoadingScreen = ({
  docTypeName,
  source,
}: {
  docTypeName?: string | null;
  source: "teachingMaterial" | "lessonPlan";
}) => {
  return (
    <OakFlex
      $position="absolute"
      $top="spacing-0"
      $left="spacing-0"
      $right="spacing-0"
      $bottom="spacing-0"
      $background="white"
    >
      <OakFlex
        $mh="spacing-48"
        $flexDirection="column"
        $alignItems="center"
        $justifyContent="center"
        $gap="spacing-12"
        $height="100%"
        $width="100%"
      >
        {source === "lessonPlan" ? (
          <>
            <OakP $textAlign={"center"} $font="heading-6">
              Generating lesson details
            </OakP>
            <OakP $textAlign={"center"} $mb={"spacing-24"} $font="body-2">
              {`These details will ensure Aila has the right context for your ${docTypeName ?? "teaching material"}.`}
            </OakP>
            <OakLoadingSpinner $width="spacing-56" />
          </>
        ) : (
          <>
            <OakP $textAlign={"center"} $mb={"spacing-24"} $font="heading-6">
              Creating your{" "}
              {docTypeName ? docTypeName.toLowerCase() : "teaching material"}
            </OakP>

            <OakLoadingSpinner $width="spacing-56" />
          </>
        )}
      </OakFlex>
    </OakFlex>
  );
};

export default StepLoadingScreen;
