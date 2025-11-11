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
      $top="all-spacing-0"
      $left="all-spacing-0"
      $right="all-spacing-0"
      $bottom="all-spacing-0"
      $background="white"
    >
      <OakFlex
        $mh="space-between-l"
        $flexDirection="column"
        $alignItems="center"
        $justifyContent="center"
        $gap="all-spacing-3"
        $height="100%"
        $width="100%"
      >
        {source === "lessonPlan" ? (
          <>
            <OakP $textAlign={"center"} $font="heading-6">
              Generating lesson details
            </OakP>
            <OakP $textAlign={"center"} $mb={"space-between-m"} $font="body-2">
              {`These details will ensure Aila has the right context for your ${docTypeName ?? "teaching material"}.`}
            </OakP>
            <OakLoadingSpinner $width="all-spacing-10" />
          </>
        ) : (
          <>
            <OakP
              $textAlign={"center"}
              $mb={"space-between-m"}
              $font="heading-6"
            >
              Creating your{" "}
              {docTypeName ? docTypeName.toLowerCase() : "teaching material"}
            </OakP>

            <OakLoadingSpinner $width="all-spacing-10" />
          </>
        )}
      </OakFlex>
    </OakFlex>
  );
};

export default StepLoadingScreen;
