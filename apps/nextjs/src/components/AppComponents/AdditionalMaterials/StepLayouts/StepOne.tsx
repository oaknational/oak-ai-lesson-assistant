import { useEffect, useState } from "react";

import { getResourceTypes } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";

import {
  OakFlex,
  OakIcon,
  OakLabel,
  OakP,
  OakPrimaryButton,
  OakPrimaryInvertedButton,
  OakRadioButton,
  OakRadioGroup,
} from "@oaknational/oak-components";

import {
  useResourcesActions,
  useResourcesStore,
} from "@/stores/ResourcesStoreProvider";
import { docTypeSelector } from "@/stores/resourcesStore/selectors";

import { useDialog } from "../../DialogContext";
import FormValidationWarning from "../../FormValidationWarning";
import ResourcesFooter from "../ResourcesFooter";
import { handleDialogSelection } from "./helpers";

const StepOne = ({
  handleCreateSession,
}: {
  handleCreateSession: ({ documentType }: { documentType: string }) => void;
}) => {
  const { setDocType, setGeneration, setSubject, setTitle, setYear } =
    useResourcesActions();
  const docType = useResourcesStore(docTypeSelector);
  const error = useResourcesStore((state) => state.error);
  const [showValidationError, setShowValidationError] = useState("");
  const { setDialogWindow } = useDialog();

  useEffect(() => {
    // Reset the document type when the component is mounted
    setDocType(null);
    setGeneration(null);
    setSubject(null);
    setTitle(null);
    setYear(null);
  }, [setDocType, setGeneration, setSubject, setTitle, setYear]);

  const resourceTypes = getResourceTypes().filter(
    (resourceType) => resourceType.isAvailable,
  );

  handleDialogSelection({ threatDetected: undefined, error, setDialogWindow });

  return (
    <>
      <OakFlex $gap={"space-between-m"} $flexDirection="column">
        <OakFlex $flexDirection={"column"}>
          <OakFlex $mv={"space-between-s"}>
            <OakRadioGroup
              name="radio-group"
              onChange={(value) => {
                const selectedDocType = value.target.value;
                setDocType(selectedDocType);
                setGeneration(null);
              }}
              $flexDirection="column"
            >
              {resourceTypes.map((resourceType) => (
                <OakLabel key={resourceType.id}>
                  <OakRadioButton
                    id={resourceType.id}
                    value={resourceType.id}
                    radioInnerSize="all-spacing-5"
                    radioOuterSize="all-spacing-6"
                    label={
                      <OakFlex
                        $flexDirection="column"
                        $gap="all-spacing-2"
                        $ml="space-between-ssx"
                      >
                        <OakP $font="body-2-bold">
                          {resourceType.displayName}
                        </OakP>
                        <OakP $font="body-2">{resourceType.description}</OakP>
                      </OakFlex>
                    }
                  />
                </OakLabel>
              ))}
              {!!showValidationError && (
                <FormValidationWarning errorMessage={showValidationError} />
              )}
            </OakRadioGroup>
          </OakFlex>
        </OakFlex>
      </OakFlex>

      <ResourcesFooter>
        <OakFlex $justifyContent="space-between" $width={"100%"}>
          <OakPrimaryInvertedButton
            element="a"
            href="/aila"
            iconName="chevron-left"
          >
            Back a step
          </OakPrimaryInvertedButton>

          <OakPrimaryButton
            onClick={() => {
              if (!docType) {
                setShowValidationError("Please select a document type.");
                return;
              }

              handleCreateSession({ documentType: docType });
            }}
            iconName="arrow-right"
            isTrailingIcon={true}
          >
            Next, provide lesson details
          </OakPrimaryButton>
        </OakFlex>
      </ResourcesFooter>
    </>
  );
};

export default StepOne;
