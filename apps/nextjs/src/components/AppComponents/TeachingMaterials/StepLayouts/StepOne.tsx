import { useState } from "react";

import { getMaterialTypes } from "@oakai/teaching-materials/src/documents/teachingMaterials/materialTypes";

import {
  OakFlex,
  OakLabel,
  OakP,
  OakRadioButton,
  OakRadioGroup,
} from "@oaknational/oak-components";

import {
  useTeachingMaterialsActions,
  useTeachingMaterialsStore,
} from "@/stores/TeachingMaterialsStoreProvider";
import { docTypeSelector } from "@/stores/teachingMaterialsStore/selectors";
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
  ) => Promise<{ success: boolean }>;
}) => {
  const { setDocType, setGeneration, setIsMaterialLoading, generateMaterial } =
    useTeachingMaterialsActions();

  const docType = useTeachingMaterialsStore(docTypeSelector);
  const error = useTeachingMaterialsStore((state) => state.error);

  const lesson = useTeachingMaterialsStore(
    (state) => state.pageData.lessonPlan,
  );
  const [showValidationError, setShowValidationError] = useState("");
  const { setDialogWindow } = useDialog();

  const materialTypes = getMaterialTypes().filter(
    (materialType) => materialType.isAvailable,
  );

  handleDialogSelection({ threatDetected: undefined, error, setDialogWindow });

  return (
    <>
      <OakFlex $gap={"spacing-24"} $flexDirection="column">
        {!!showValidationError && (
          <FormValidationWarning errorMessage={showValidationError} />
        )}
        <OakFlex $mv={"spacing-16"}>
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
              $gap={"spacing-24"}
            >
              {materialTypes.map((materialType) => (
                <OakLabel key={materialType.id}>
                  <OakRadioButton
                    id={materialType.id}
                    value={materialType.id}
                    radioInnerSize="spacing-20"
                    radioOuterSize="spacing-24"
                    label={
                      <OakFlex $flexDirection="column" $ml="spacing-8">
                        <OakP $font="body-2-bold">
                          {materialType.displayName}
                        </OakP>
                        <OakP $font="body-2">{materialType.description}</OakP>
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
            lesson.lessonId
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

            if (lesson.lessonId) {
              void (async () => {
                setIsMaterialLoading(true);
                await handleCreateSession(docType, 3);
                void generateMaterial();
              })();
            } else {
              void handleCreateSession(docType);
            }
          }}
        />
      </ResourcesFooter>
    </>
  );
};

export default StepOne;
