import { lessonFieldKeys } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import type { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";
import { sectionToMarkdown } from "@oakai/aila/src/protocol/sectionToMarkdown";
import { camelCaseToTitleCase } from "@oakai/exports/src/utils";
import { aiLogger } from "@oakai/logger";

import {
  OakBox,
  OakFlex,
  OakIcon,
  OakLink,
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

export function mapLessonPlanSections(
  lessonPlan: AilaPersistedChat["lessonPlan"],
) {
  return lessonFieldKeys.map((key) => ({ key, data: lessonPlan[key] ?? null }));
}

const log = aiLogger("additional-materials");

const StepTwo = () => {
  const pageData = useResourcesStore(pageDataSelector);
  const docType = useResourcesStore(docTypeSelector);
  const moderation = useResourcesStore(moderationSelector);
  const isLoadingLessonPlan = useResourcesStore(isLoadingLessonPlanSelector);
  const threatDetected = useResourcesStore(threatDetectionSelector);
  const docTypeName = docType?.split("-")[1] ?? null;
  const { setDialogWindow } = useDialog();

  const { setStepNumber, generateMaterial } = useResourcesActions();
  const fetchMaterial =
    trpc.additionalMaterials.generateAdditionalMaterial.useMutation();

  const handleSubmit = () => {
    generateMaterial({
      mutateAsync: async (input) => {
        try {
          return fetchMaterial.mutateAsync(input);
        } catch (error) {
          throw error instanceof Error ? error : new Error(String(error));
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

  return (
    <>
      <OakFlex $flexDirection="column">
        <OakFlex $flexDirection="column">
          <OakP $font={"heading-5"}>Lesson details</OakP>
          {moderation?.categories && moderation.categories.length > 0 && (
            <ModerationMessage />
          )}

          <OakBox $pa="inner-padding-m">
            <OakP>
              {kebabCaseToSentenceCase(pageData.lessonPlan.keyStage ?? "")},{" "}
              {pageData.lessonPlan.subject}, {pageData.lessonPlan.title}
            </OakP>
          </OakBox>
        </OakFlex>

        {mapLessonPlanSections(pageData.lessonPlan).map((section) => {
          const title = camelCaseToTitleCase(section.key) ?? "";
          if (
            section.key === "learningOutcome" ||
            section.key === "learningCycles"
          ) {
            return (
              <OakFlex key={section.key} $flexDirection={"column"}>
                <OakP $font={"heading-5"}>{section.key}</OakP>
                <OakFlex $pv="inner-padding-m">
                  <OakFlex $flexDirection="column">
                    <MemoizedReactMarkdownWithStyles
                      markdown={`${sectionToMarkdown(title, section.data)}`}
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
          <OakLink onClick={() => setStepNumber(0)}>
            <OakFlex $alignItems="center" $gap="all-spacing-2">
              <OakIcon iconName="chevron-left" />
              Back a step
            </OakFlex>
          </OakLink>

          <OakPrimaryButton
            onClick={() => {
              void handleSubmit();
              setStepNumber(2);
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

function kebabCaseToSentenceCase(str: string) {
  return str.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default StepTwo;
