import { useEffect, useState } from "react";

import { getResourceTypes } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";

import {
  OakFlex,
  OakLabel,
  OakP,
  OakRadioButton,
  OakRadioGroup,
} from "@oaknational/oak-components";

import {
  useResourcesActions,
  useResourcesStore,
} from "@/stores/ResourcesStoreProvider";
import { docTypeSelector } from "@/stores/resourcesStore/selectors";
import { getAilaUrl } from "@/utils/getAilaUrl";

import { useDialog } from "../../DialogContext";
import FormValidationWarning from "../../FormValidationWarning";
import ResourcesFooter from "../ResourcesFooter";
import SharedNavigationButtons from "./SharedFooterNavigationButtons";
import { handleDialogSelection } from "./helpers";

const StepOne = ({
  handleCreateSession,
}: {
  handleCreateSession: (
    docType: string | null,
    stepNumber?: number,
  ) => Promise<void>;
}) => {
  const {
    setDocType,
    setGeneration,
    setSubject,
    setTitle,
    setYear,
    generateMaterial,
  } = useResourcesActions();
  const docType = useResourcesStore(docTypeSelector);
  const error = useResourcesStore((state) => state.error);

  const source = useResourcesStore((state) => state.source);
  const lesson = useResourcesStore((state) => state.pageData.lessonPlan);
  const [showValidationError, setShowValidationError] = useState("");
  const { setDialogWindow } = useDialog();

  // useEffect(() => {
  //   // Reset the document type when the component is mounted
  //   if (source === "owa" && lesson) {
  //     setDocType(null);
  //     setGeneration(null);
  //   } else {
  //     setDocType(null);
  //     setGeneration(null);
  //     setSubject(null);
  //     setTitle(null);
  //     setYear(null);
  //   }
  // }, [
  //   lesson,
  //   setDocType,
  //   setGeneration,
  //   setSubject,
  //   setTitle,
  //   setYear,
  //   source,
  // ]);

  const resourceTypes = getResourceTypes().filter(
    (resourceType) => resourceType.isAvailable,
  );

  handleDialogSelection({ threatDetected: undefined, error, setDialogWindow });

  return (
    <>
      <OakFlex $gap={"space-between-m"} $flexDirection="column">
        {!!showValidationError && (
          <FormValidationWarning errorMessage={showValidationError} />
        )}
        <OakFlex $mv={"space-between-s"}>
          <OakFlex $flexDirection={"column"}>
            <OakRadioGroup
              name="radio-group"
              onChange={(value) => {
                const selectedDocType = value.target.value;
                setDocType(selectedDocType);
                setGeneration(null);
                setShowValidationError("");
              }}
              $flexDirection="column"
              $gap={"space-between-m"}
            >
              {resourceTypes.map((resourceType) => (
                <OakLabel key={resourceType.id}>
                  <OakRadioButton
                    id={resourceType.id}
                    value={resourceType.id}
                    radioInnerSize="all-spacing-5"
                    radioOuterSize="all-spacing-6"
                    label={
                      <OakFlex $flexDirection="column" $ml="space-between-ssx">
                        <OakP $font="body-2-bold">
                          {resourceType.displayName}
                        </OakP>
                        <OakP $font="body-2">{resourceType.description}</OakP>
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
        <SharedNavigationButtons
          backLabel="Back a step"
          nextLabel={
            source == "owa" && lesson
              ? "Create teaching material"
              : "Next, provide lesson details"
          }
          onBackClick={() => {}} // href used here instead
          backHref={getAilaUrl("start")}
          onNextClick={() => {
            if (!docType) {
              setShowValidationError("Please select a teaching material.");
              return;
            }
            if (source === "aila") void handleCreateSession(docType);
            if (source === "owa" && lesson) {
              void handleCreateSession(docType, 3);
              void generateMaterial();
            }
          }}
        />
      </ResourcesFooter>
    </>
  );
};

export default StepOne;
