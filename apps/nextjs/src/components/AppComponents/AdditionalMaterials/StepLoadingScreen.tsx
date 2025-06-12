import type { AdditionalMaterialType } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { resourceTypesConfig } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";

import {
  OakBox,
  OakFlex,
  OakLoadingSpinner,
  OakP,
} from "@oaknational/oak-components";

const StepLoadingScreen = ({
  docTypeName,
}: {
  docTypeName?: string | null;
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
        $gap="all-spacing-3"
        $height="100%"
        $width="100%"
      >
        {docTypeName === undefined ? (
          <>
            <OakP $font="heading-6">Generating lesson details</OakP>
            <OakP $mb={"space-between-m"} $font="body-2">
              {`These details will ensure Aila has the right context for your ${docTypeName ? docTypeName : "teaching material"}.`}
            </OakP>
            <OakLoadingSpinner $width="all-spacing-10" />
          </>
        ) : (
          <>
            <OakP $mb={"space-between-m"} $font="heading-6">
              Creating your{" "}
              {docTypeName ? docTypeName.toLowerCase() : "teaching material"}
            </OakP>

            <OakLoadingSpinner $width="all-spacing-10" />
          </>
        )}
      </OakFlex>
    </OakBox>
  );
};

export default StepLoadingScreen;
