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
  const docTypeName = docType?.split("-")[1] ?? null;

  const { setStepNumber, generateMaterial } = useResourcesActions();
  const fetchMaterial =
    trpc.additionalMaterials.generateAdditionalMaterial.useMutation();

  const handleSubmit = (message) => {
    const generatePromise = generateMaterial({
      message,
      mutateAsync: fetchMaterial.mutateAsync,
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
        <OakFlex $flexDirection="column">
          <OakP $font={"heading-5"}>Lesson details</OakP>

          <OakBox $pa="inner-padding-m">
            <OakP>
              {kebabCaseToSentenceCase(pageData.lessonPlan.keyStage || "")},{" "}
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
            onClick={async () => {
              await handleSubmit("Create a lesson plan for this lesson");
              setStepNumber(2);
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
