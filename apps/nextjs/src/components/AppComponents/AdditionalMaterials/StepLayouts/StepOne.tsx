import { useEffect } from "react";

import { getResourceTypes } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";

import {
  OakFlex,
  OakIcon,
  OakLabel,
  OakP,
  OakPrimaryButton,
  OakRadioButton,
  OakRadioGroup,
} from "@oaknational/oak-components";

import {
  useResourcesActions,
  useResourcesStore,
} from "@/stores/ResourcesStoreProvider";
import { docTypeSelector } from "@/stores/resourcesStore/selectors";

import { useDialog } from "../../DialogContext";
import ResourcesFooter from "../ResourcesFooter";
import { handleDialogSelection } from "./helpers";

const StepOne = () => {
  const { setStepNumber, setDocType, setGeneration } = useResourcesActions();
  const docType = useResourcesStore(docTypeSelector);
  const error = useResourcesStore((state) => state.error);

  const { setDialogWindow } = useDialog();

  useEffect(() => {
    // Reset the document type when the component is mounted
    setDocType(null);
    setGeneration(null);
  }, [setDocType, setGeneration]);

  const resourceTypes = getResourceTypes().filter(
    (resourceType) => resourceType.isAvailable,
  );

  handleDialogSelection({ threatDetected: undefined, error, setDialogWindow });

  return (
    <>
      <OakFlex $gap={"space-between-m"} $flexDirection="column">
        <OakFlex $flexDirection={"column"}>
          <OakFlex $mv={"space-between-l"}>
            <OakRadioGroup
              name="radio-group"
              onChange={(value) => {
                setDocType(value.target.value);
                setGeneration(null);
              }}
              $flexDirection="column"
            >
              {resourceTypes.map((resourceType) => (
                <OakLabel key={resourceType.id}>
                  <OakRadioButton
                    id={resourceType.id}
                    value={resourceType.id}
                    radioInnerSize="all-spacing-6"
                    radioOuterSize="all-spacing-7"
                    label={
                      <OakFlex
                        $flexDirection="column"
                        $gap="all-spacing-2"
                        $ml="space-between-xs"
                      >
                        <OakP $font="heading-6">
                          {resourceType.displayName}
                        </OakP>
                        <OakP>{resourceType.description}</OakP>
                      </OakFlex>
                    }
                  />
                </OakLabel>
              ))}
            </OakRadioGroup>
          </OakFlex>
        </OakFlex>
      </OakFlex>

      <ResourcesFooter>
        <OakFlex $justifyContent="flex-end" $width={"100%"}>
          <OakPrimaryButton
            onClick={() => setStepNumber(1)}
            iconName="arrow-right"
            isTrailingIcon={true}
            disabled={!docType}
          >
            Continue
          </OakPrimaryButton>
        </OakFlex>
      </ResourcesFooter>
    </>
  );
};

export default StepOne;
