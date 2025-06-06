import type { ComprehensionTask as ComprehensionTaskType } from "@oakai/additional-materials/src/documents/additionalMaterials/comprehension/schema";

import { OakBox, OakFlex, OakHeading, OakP } from "@oaknational/oak-components";

export const ComprehensionTask = ({
  action,
  generation,
}: {
  action: string;
  generation: ComprehensionTaskType;
}) => {
  if (!generation || !action) {
    return;
  }

  return (
    <OakFlex $gap={"space-between-s"} $flexDirection="column" $width="100%">
      <OakHeading $font={"heading-4"} tag="h2">
        {generation.comprehension.lessonTitle}
      </OakHeading>

      <OakBox $mt="space-between-xs">
        <OakFlex $flexDirection="column" $gap="space-between-xs">
          <OakP $font="body-1">{generation.comprehension.instructions}</OakP>
        </OakFlex>
      </OakBox>

      <OakBox $mt="space-between-m">
        <OakP $font="body-1">{generation.comprehension.text}</OakP>
      </OakBox>

      <OakHeading $font={"heading-5"} tag="h3" $mt="space-between-m">
        Questions
      </OakHeading>

      <OakFlex $gap={"space-between-s"} $flexDirection="column">
        {generation.comprehension.questions.map((question, index) => (
          <OakFlex
            $gap="space-between-xs"
            $flexDirection={"column"}
            key={index}
          >
            <OakP $font="heading-6">
              {question.questionNumber}. {question.questionText}
            </OakP>
          </OakFlex>
        ))}
      </OakFlex>

      <OakHeading $font={"heading-5"} tag="h3" $mt="space-between-m">
        Answers
      </OakHeading>

      <OakFlex $gap={"space-between-s"} $flexDirection="column">
        {generation.comprehension.questions.map((question, index) => (
          <OakFlex
            $gap="space-between-xs"
            $flexDirection={"column"}
            key={index}
          >
            <OakP $font="heading-6">
              {question.questionNumber}. {question.questionText}
            </OakP>
            <OakP $font="body-1">{question.answer}</OakP>
          </OakFlex>
        ))}
      </OakFlex>
    </OakFlex>
  );
};
