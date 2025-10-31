import { getResourceType } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import { lessonFieldKeys } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import type { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";

import {
  OakFlex,
  OakHeading,
  OakLI,
  OakLink,
  OakOL,
  OakP,
} from "@oaknational/oak-components";

import {
  useTeachingMaterialsActions,
  useTeachingMaterialsStore,
} from "@/stores/TeachingMaterialsStoreProvider";
import {
  docTypeSelector,
  isLoadingLessonPlanSelector,
  moderationSelector,
  pageDataSelector,
  threatDetectionSelector,
} from "@/stores/teachingMaterialsStore/selectors";

import { useDialog } from "../../DialogContext";
import { ModerationMessage } from "../AdditionalMaterialMessage";
import ResourcesFooter from "../ResourcesFooter";
import StepLoadingScreen from "../StepLoadingScreen";
import SharedNavigationButtons from "./SharedFooterNavigationButtons";

export function mapLessonPlanSections(
  lessonPlan: AilaPersistedChat["lessonPlan"],
) {
  return lessonFieldKeys.map((key) => ({ key, data: lessonPlan[key] ?? null }));
}

const StepThree = ({ handleSubmit }: { handleSubmit: () => Promise<void> }) => {
  const pageData = useTeachingMaterialsStore(pageDataSelector);
  const docType = useTeachingMaterialsStore(docTypeSelector);
  const moderation = useTeachingMaterialsStore(moderationSelector);
  const isLoadingLessonPlan = useTeachingMaterialsStore(isLoadingLessonPlanSelector);
  const threatDetected = useTeachingMaterialsStore(threatDetectionSelector);

  const { setDialogWindow } = useDialog();

  // Get resource type from configuration
  const resourceType = docType ? getResourceType(docType) : null;
  const docTypeName = resourceType
    ? resourceType.displayName.toLowerCase()
    : null;

  const { setStepNumber } = useTeachingMaterialsActions();

  if (isLoadingLessonPlan) {
    return <StepLoadingScreen source="lessonPlan" docTypeName={docTypeName} />;
  }
  if (threatDetected) {
    setDialogWindow("additional-materials-threat-detected");
  }

  const hasModeration =
    moderation?.categories && moderation.categories.length > 0;

  return (
    <>
      <OakFlex $flexDirection="column">
        <OakFlex $flexDirection="column" $mb="space-between-xxl">
          <OakHeading $mb={"space-between-xs"} tag="h2" $font={"heading-6"}>
            Learning outcome
          </OakHeading>
          <OakP $mb={"space-between-m"} $font="body-2">
            {pageData.lessonPlan.learningOutcome}
          </OakP>

          <OakHeading $mb={"space-between-xs"} tag="h2" $font={"heading-6"}>
            Key learning points
          </OakHeading>

          <OakOL>
            {pageData.lessonPlan.keyLearningPoints?.map((point, index) => (
              <OakLI $font="body-2" key={`${index}-${point}`}>
                {typeof point === "string" && point.endsWith(".")
                  ? point.slice(0, -1)
                  : point}
              </OakLI>
            ))}
          </OakOL>

          {hasModeration && <ModerationMessage />}
        </OakFlex>

        <OakP $font="body-2">
          {`If these details look right for your lesson, create your ${docTypeName}. If not return to the `}
          <OakLink color="black" onClick={() => setStepNumber(1)}>
            previous page
          </OakLink>
          {` and tell Aila what your lesson should include.`}
        </OakP>
      </OakFlex>

      <ResourcesFooter>
        <SharedNavigationButtons
          backLabel="Back a step"
          nextLabel={`Create ${docTypeName}`}
          mobileNextLabel="Create"
          onBackClick={() => setStepNumber(1, "back_a_step_button")}
          onNextClick={() => {
            void handleSubmit();
          }}
        />
      </ResourcesFooter>
    </>
  );
};

export default StepThree;
