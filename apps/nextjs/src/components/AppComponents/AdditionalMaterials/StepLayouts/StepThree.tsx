import { getResourceType } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import { lessonFieldKeys } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import type { PartialLessonPlanFieldKeyArray } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import type { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";
import { sectionToMarkdown } from "@oakai/aila/src/protocol/sectionToMarkdown";
import {
  camelCaseToSentenceCase,
  kebabCaseToSentenceCase,
} from "@oakai/core/src/utils/camelCaseConversion";
import { aiLogger } from "@oakai/logger";

import {
  OakBox,
  OakFlex,
  OakIcon,
  OakP,
  OakPrimaryButton,
} from "@oaknational/oak-components";
import * as Sentry from "@sentry/nextjs";

import {
  useResourcesActions,
  useResourcesStore,
} from "@/stores/ResourcesStoreProvider";
import {
  docTypeSelector,
  isLoadingLessonPlanSelector,
  moderationSelector,
  pageDataSelector,
  threatDetectionSelector,
} from "@/stores/resourcesStore/selectors";
import { trpc } from "@/utils/trpc";

import { MemoizedReactMarkdownWithStyles } from "../../Chat/markdown";
import { useDialog } from "../../DialogContext";
import { ModerationMessage } from "../AdditionalMaterialMessage";
import ResourcesFooter from "../ResourcesFooter";
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

const StepThree = () => {
  const pageData = useResourcesStore(pageDataSelector);
  const docType = useResourcesStore(docTypeSelector);
  const moderation = useResourcesStore(moderationSelector);
  const isLoadingLessonPlan = useResourcesStore(isLoadingLessonPlanSelector);
  const threatDetected = useResourcesStore(threatDetectionSelector);
  const error = useResourcesStore((state) => state.error);
  const { setDialogWindow } = useDialog();

  // Get resource type from configuration
  const resourceType = docType ? getResourceType(docType) : null;
  const docTypeName = resourceType
    ? resourceType.displayName.toLowerCase()
    : null;

  const { setStepNumber, generateMaterial } = useResourcesActions();
  const fetchMaterial =
    trpc.additionalMaterials.generateAdditionalMaterial.useMutation();

  const handleSubmit = () => {
    void generateMaterial({
      mutateAsync: async (input) => {
        try {
          return await fetchMaterial.mutateAsync(input);
        } catch (e) {
          const error = e instanceof Error ? e : new Error(String(e));
          Sentry.captureException(error);

          throw error;
        }
      },
    });
  };

  if (isLoadingLessonPlan) {
    return <OakP>Building lesson plan...</OakP>;
  }
  if (threatDetected) {
    setDialogWindow("additional-materials-threat-detected");
  }

  // const refinementOptions = getRefinementOptions();
  const hasModeration =
    moderation?.categories && moderation.categories.length > 0;

  handleDialogSelection({ threatDetected: undefined, error, setDialogWindow });

  return (
    <>
      <OakFlex $flexDirection="column">
        <OakFlex $flexDirection="column" $mb="space-between-m">
          <OakP $font={"heading-5"}>Task details</OakP>
          {moderation?.categories && moderation.categories.length > 0 && (
            <ModerationMessage />
          )}

          <OakBox $pv="inner-padding-m">
            <OakP>
              {toTitleCase(docTypeName ?? "")},{" "}
              {kebabCaseToSentenceCase(pageData.lessonPlan.keyStage ?? "")},{" "}
              {pageData.lessonPlan.subject}, {pageData.lessonPlan.title}
            </OakP>
          </OakBox>
        </OakFlex>

        {mapLessonPlanSections(pageData.lessonPlan).map((section) => {
          const title = camelCaseToSentenceCase(section.key) ?? "";
          if (
            resourceType?.lessonParts &&
            isValidLessonPart(section.key) &&
            resourceType.lessonParts.includes(section.key)
          ) {
            return (
              <OakFlex
                key={section.key}
                $flexDirection={"column"}
                $mb="space-between-m"
              >
                <OakP $font={"heading-5"}>{title}</OakP>
                <OakFlex $pv="inner-padding-m">
                  <OakFlex $flexDirection="column">
                    <MemoizedReactMarkdownWithStyles
                      markdown={`${sectionToMarkdown(section.key, section.data)}`}
                    />
                  </OakFlex>
                </OakFlex>
              </OakFlex>
            );
          }
          return null;
        })}
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
              setStepNumber(3);
              return null;
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

function toTitleCase(str: string) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export default StepThree;
