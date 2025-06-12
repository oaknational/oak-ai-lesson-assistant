import { getResourceType } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import { lessonFieldKeys } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import type { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";
import { sectionToMarkdown } from "@oakai/aila/src/protocol/sectionToMarkdown";
import { camelCaseToSentenceCase } from "@oakai/core/src/utils/camelCaseConversion";
import { aiLogger } from "@oakai/logger";

import {
  OakBox,
  OakFlex,
  OakHeading,
  OakIcon,
  OakLI,
  OakLink,
  OakOL,
  OakP,
  OakPrimaryButton,
} from "@oaknational/oak-components";

import {
  useResourcesActions,
  useResourcesStore,
} from "@/stores/ResourcesStoreProvider";
import {
  docTypeSelector,
  errorSelector,
  isLoadingLessonPlanSelector,
  moderationSelector,
  pageDataSelector,
  threatDetectionSelector,
  yearSelector,
} from "@/stores/resourcesStore/selectors";

import { MemoizedReactMarkdownWithStyles } from "../../Chat/markdown";
import { useDialog } from "../../DialogContext";
import { ModerationMessage } from "../AdditionalMaterialMessage";
import ResourcesFooter from "../ResourcesFooter";
import StepLoadingScreen from "../StepLoadingScreen";
import { handleDialogSelection } from "./helpers";

type LessonPlanSectionKey = (typeof lessonFieldKeys)[number];

// Type guard to check if a key is a valid lesson part
function isValidLessonPart(
  key: LessonPlanSectionKey,
): key is Extract<
  LessonPlanSectionKey,
  | "learningOutcome"
  | "learningCycles"
  | "keyLearningPoints"
  | "misconceptions"
  | "keywords"
> {
  return [
    "learningOutcome",
    "learningCycles",
    "keyLearningPoints",
    "misconceptions",
    "keywords",
  ].includes(key);
}

export function mapLessonPlanSections(
  lessonPlan: AilaPersistedChat["lessonPlan"],
) {
  return lessonFieldKeys.map((key) => ({ key, data: lessonPlan[key] ?? null }));
}

const log = aiLogger("additional-materials");

const StepThree = ({ handleSubmit }: { handleSubmit: () => void }) => {
  const pageData = useResourcesStore(pageDataSelector);
  const docType = useResourcesStore(docTypeSelector);
  const moderation = useResourcesStore(moderationSelector);
  const isLoadingLessonPlan = useResourcesStore(isLoadingLessonPlanSelector);
  const threatDetected = useResourcesStore(threatDetectionSelector);
  const year = useResourcesStore(yearSelector);
  const error = useResourcesStore(errorSelector);
  const { setDialogWindow } = useDialog();

  // Get resource type from configuration
  const resourceType = docType ? getResourceType(docType) : null;
  const docTypeName = resourceType
    ? resourceType.displayName.toLowerCase()
    : null;

  const { setStepNumber } = useResourcesActions();

  if (isLoadingLessonPlan) {
    return <StepLoadingScreen source="lessonPlan" docTypeName={docTypeName} />;
  }
  if (threatDetected) {
    setDialogWindow("additional-materials-threat-detected");
  }

  handleDialogSelection({ threatDetected, error, setDialogWindow });

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

          <OakP $font="body-2" $mb={"space-between-m"}>
            This lesson would include:
          </OakP>

          <OakOL>
            {pageData.lessonPlan.keyLearningPoints?.map((point, index) => (
              <OakLI $font="body-2" key={index}>
                {point}
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
        <OakFlex $justifyContent="space-between" $width={"100%"}>
          <button onClick={() => setStepNumber(1)}>
            <OakFlex $alignItems="center" $gap="all-spacing-2">
              <OakIcon iconName="chevron-left" />
              Back a step
            </OakFlex>
          </button>

          <OakPrimaryButton
            onClick={() => {
              void handleSubmit();
            }}
            iconName="arrow-right"
            isTrailingIcon={true}
          >
            Create {docTypeName}
          </OakPrimaryButton>
        </OakFlex>
      </ResourcesFooter>
    </>
  );
};

export default StepThree;
