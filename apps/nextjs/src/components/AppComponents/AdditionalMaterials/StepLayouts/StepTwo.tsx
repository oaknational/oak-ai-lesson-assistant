import { getResourceType } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import { lessonFieldKeys } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
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
  pageDataSelector,
} from "@/stores/resourcesStore/selectors";
import { trpc } from "@/utils/trpc";

import { MemoizedReactMarkdownWithStyles } from "../../Chat/markdown";
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

  const isLoadingLessonPlan = useResourcesStore(isLoadingLessonPlanSelector);

  // Get resource type from configuration
  const resourceType = docType ? getResourceType(docType) : null;
  const docTypeName = resourceType
    ? resourceType.displayName.toLowerCase()
    : null;

  const { setStepNumber, generateMaterial } = useResourcesActions();
  const fetchMaterial =
    trpc.additionalMaterials.generateAdditionalMaterial.useMutation();

  const handleSubmit = (message) => {
    const generatePromise = generateMaterial({
      message,
      mutateAsync: async (input) => {
        try {
          return fetchMaterial.mutateAsync(input);
        } catch (error) {
          throw error instanceof Error ? error : new Error(String(error));
        }
      },
    });

    // Navigate to the next step
    generatePromise
      .then(() => setStepNumber(2))
      .catch((error) => {
        log.error("Failed to generate material", error);
        Sentry.captureException(error);
      });

    return generatePromise;
  };

  if (isLoadingLessonPlan) {
    return <OakP>Building lesson plan...</OakP>;
  }

  return (
    <>
      <OakFlex $flexDirection="column">
        <OakFlex $flexDirection="column" $mb="space-between-m">
          <OakP $font={"heading-5"}>Task details</OakP>

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
          // Check if the section should be displayed based on the resource type's lessonParts
          if (resourceType?.lessonParts?.includes(section.key)) {
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
          <button onClick={() => setStepNumber(0)}>
            <OakFlex $alignItems="center" $gap="all-spacing-2">
              <OakIcon iconName="chevron-left" />
              Back a step
            </OakFlex>
          </button>

          <OakPrimaryButton
            onClick={() => {
              void handleSubmit("Create a lesson plan for this lesson");
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

function toTitleCase(str: string) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export default StepTwo;
