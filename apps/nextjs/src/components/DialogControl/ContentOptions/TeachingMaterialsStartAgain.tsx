import { useState } from "react";

import { materialTypesConfig } from "@oakai/teaching-materials/src/documents/teachingMaterials/materialTypes";

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
  useTeachingMaterialsActions,
  useTeachingMaterialsStore,
} from "@/stores/TeachingMaterialsStoreProvider";
import { docTypeSelector } from "@/stores/teachingMaterialsStore/selectors";

type TeachingMaterialsStartAgainProps = {
  closeDialog: () => void;
};

const TeachingMaterialsStartAgain = ({
  closeDialog,
}: Readonly<TeachingMaterialsStartAgainProps>) => {
  const docType = useTeachingMaterialsStore(docTypeSelector);

  const lessonTitle = useTeachingMaterialsStore(
    (state) => state.pageData.lessonPlan.title,
  );
  invariant(docType, "docType must be defined");
  const docTypeDisplayName =
    materialTypesConfig[docType].displayName.toLowerCase();
  const { setStepNumber, setId, setDocType, setGeneration } =
    useTeachingMaterialsActions();
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
      $ph={["spacing-16", "spacing-80"]}
      $mb="spacing-24"
    >
      <OakFlex $gap={"spacing-24"} $flexDirection="column" $mb="spacing-24">
        <OakHeading $font="heading-5" tag="h1" $mb="spacing-8">
          What would you like to create?
        </OakHeading>

        <OakFlex $flexDirection="column" $mb="spacing-8">
          <OakRadioGroup
            name="create-option"
            onChange={(value) => setSelectedOption(value.target.value)}
            $flexDirection="column"
            $gap="spacing-32"
          >
            <OakRadioButton
              id="current-lesson"
              value="current-lesson"
              radioInnerSize="spacing-20"
              radioOuterSize="spacing-24"
              label={
                <OakFlex
                  $flexDirection="column"
                  $ml="spacing-12"
                  $gap={"spacing-4"}
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
              radioInnerSize="spacing-20"
              radioOuterSize="spacing-24"
              label={
                <OakFlex
                  $flexDirection="column"
                  $ml="spacing-12"
                  $gap={"spacing-4"}
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
      <OakFlex $flexDirection="column" $mt="spacing-8">
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

export default TeachingMaterialsStartAgain;
