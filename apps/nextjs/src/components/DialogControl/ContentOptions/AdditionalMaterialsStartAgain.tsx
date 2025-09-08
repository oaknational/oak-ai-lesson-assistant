import { useState } from "react";

import { resourceTypesConfig } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";

import {
  OakFlex,
  OakHeading,
  OakP,
  OakPrimaryButton,
  OakRadioButton,
  OakRadioGroup,
  OakSecondaryLink,
} from "@oaknational/oak-components";
import { usePathname, useRouter } from "next/navigation";
import invariant from "tiny-invariant";

import {
  useResourcesActions,
  useResourcesStore,
} from "@/stores/ResourcesStoreProvider";
import { docTypeSelector } from "@/stores/resourcesStore/selectors";

type AdditionalMaterialsStartAgainProps = {
  closeDialog: () => void;
};

const AdditionalMaterialsStartAgain = ({
  closeDialog,
}: Readonly<AdditionalMaterialsStartAgainProps>) => {
  const docType = useResourcesStore(docTypeSelector);

  const lessonTitle = useResourcesStore(
    (state) => state.pageData.lessonPlan.title,
  );
  invariant(docType, "docType must be defined");
  const docTypeDisplayName =
    resourceTypesConfig[docType].displayName.toLowerCase();
  const { resetToDefault, setStepNumber, setId, setDocType, setGeneration } =
    useResourcesActions();
  const [selectedOption, setSelectedOption] = useState<string>("");

  const router = useRouter();
  const pathname = usePathname();

  const handleContinue = () => {
    router.replace(pathname, { scroll: false });
    if (selectedOption === "current-lesson") {
      setStepNumber(0);
      setId(null);
      setDocType(null);
      setGeneration(null);
      // Reset the dialog state
      closeDialog();
    } else if (selectedOption === "new-lesson") {
      router.push("/aila");
    }
  };

  return (
    <OakFlex
      $width="100%"
      $height="100%"
      $flexDirection="column"
      $ph={["inner-padding-m", "inner-padding-xl8"]}
      $mb="space-between-m"
    >
      <OakFlex
        $gap={"space-between-m"}
        $flexDirection="column"
        $mb="space-between-m"
      >
        <OakHeading $font="heading-5" tag="h1" $mb="space-between-ssx">
          What would you like to create?
        </OakHeading>

        <OakFlex $flexDirection="column" $mb="space-between-ssx">
          <OakRadioGroup
            name="create-option"
            onChange={(value) => setSelectedOption(value.target.value)}
            $flexDirection="column"
            $gap="space-between-m2"
          >
            <OakRadioButton
              id="current-lesson"
              $borderStyle={"none"}
              value="current-lesson"
              radioInnerSize="all-spacing-5"
              radioOuterSize="all-spacing-6"
              label={
                <OakFlex
                  $flexDirection="column"
                  $ml="space-between-xs"
                  $gap={"space-between-sssx"}
                >
                  <OakP $font="heading-7">
                    A teaching material for the current lesson
                  </OakP>
                  <OakP $font="heading-light-7">{lessonTitle}</OakP>
                </OakFlex>
              }
            />

            <OakRadioButton
              id="new-lesson"
              value="new-lesson"
              radioInnerSize="all-spacing-5"
              radioOuterSize="all-spacing-6"
              $borderStyle={"none"}
              label={
                <OakFlex
                  $flexDirection="column"
                  $ml="space-between-xs"
                  $gap={"space-between-sssx"}
                >
                  <OakP $font="heading-7">
                    A new lesson or teaching material
                  </OakP>
                  <OakP $font="heading-light-7">For a different topic</OakP>
                </OakFlex>
              }
            />
          </OakRadioGroup>
        </OakFlex>

        <OakPrimaryButton
          iconName="chevron-right"
          isTrailingIcon
          onClick={handleContinue}
          disabled={!selectedOption}
        >
          Continue
        </OakPrimaryButton>
      </OakFlex>

      <OakFlex $flexDirection="column" $mt="space-between-ssx">
        <OakP $font="body-2">
          Don&apos;t forget to{" "}
          <OakSecondaryLink
            color="text-link-active"
            element="button"
            onClick={closeDialog}
          >
            download your {docTypeDisplayName}
          </OakSecondaryLink>{" "}
          if you want to keep a copy!
        </OakP>
      </OakFlex>
    </OakFlex>
  );
};

export default AdditionalMaterialsStartAgain;
