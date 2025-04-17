import { lessonFieldKeys } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import type { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";
import { sectionToMarkdown } from "@oakai/aila/src/protocol/sectionToMarkdown";
import { camelCaseToTitleCase } from "@oakai/exports/src/utils";

import {
  OakBox,
  OakFlex,
  OakIcon,
  OakLink,
  OakP,
  OakPrimaryButton,
} from "@oaknational/oak-components";

import { MemoizedReactMarkdownWithStyles } from "../../Chat/markdown";
import ResourcesFooter from "../ResourcesFooter";

export function mapLessonPlanSections(
  lessonPlan: AilaPersistedChat["lessonPlan"],
) {
  return lessonFieldKeys.map((key) => ({ key, data: lessonPlan[key] ?? null }));
}

type StepTwoProps = {
  setStepNumber: (stepNumber: number) => void;
  pageData: {
    lessonPlan: AilaPersistedChat["lessonPlan"];
    transcript?: string | null;
  };
  handleSubmit: () => void;
  docTypeName: string | null;
  isLessonPlanLoading: boolean;
};

const StepTwo = ({
  setStepNumber,
  pageData,
  handleSubmit,
  docTypeName,
  isLessonPlanLoading,
}: StepTwoProps) => {
  if (isLessonPlanLoading) {
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
          if (
            section.key === "title" ||
            section.key === "keyStage" ||
            section.key === "subject"
          ) {
            return null;
          }

          const title = camelCaseToTitleCase(section.key) ?? "";
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
              handleSubmit();
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
