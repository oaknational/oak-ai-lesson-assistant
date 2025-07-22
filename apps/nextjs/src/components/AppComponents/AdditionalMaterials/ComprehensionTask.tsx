import type { ComprehensionTask as ComprehensionTaskType } from "@oakai/additional-materials/src/documents/additionalMaterials/comprehension/schema";

import {
  OakBox,
  OakFlex,
  OakHeading,
  OakLI,
  OakOL,
  OakP,
} from "@oaknational/oak-components";

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
      <OakBox $mt="space-between-xs">
        <OakFlex $flexDirection="column">
          <OakP $font="body-2-bold">
            {generation.comprehension.instructions}
          </OakP>
        </OakFlex>
      </OakBox>

      <OakBox $mt="space-between-s">
        {generation.comprehension.text.split("\n\n").map((paragraph, index) => (
          <OakP
            $font="body-2"
            key={`${paragraph.trim().slice(0, 8)}-${index}`}
            $mb="space-between-xs"
          >
            {paragraph.trim()}
          </OakP>
        ))}
      </OakBox>

      <OakHeading $font={"heading-6"} tag="h3" $mt="space-between-m">
        Questions
      </OakHeading>

      <OakFlex $gap={"space-between-s"} $flexDirection="column">
        <OakOL>
          {generation.comprehension.questions.map((question, index) => (
            <OakLI
              style={{
                textIndent: "0px",
                padding: "0px",
                paddingBottom: "8px",
              }}
              key={`${index}-${question.questionText}`}
              $font="body-2"
            >
              {question.questionText}
            </OakLI>
          ))}
        </OakOL>
      </OakFlex>

      <OakHeading $font={"heading-6"} tag="h3" $mt="space-between-m">
        Answers
      </OakHeading>

      <OakFlex $gap={"space-between-s"} $flexDirection="column">
        <OakOL>
          {generation.comprehension.questions.map((question, index) => (
            <OakLI
              $pa={"inner-padding-none"}
              key={`${index}-${question.questionText}`}
              $font="body-2"
              style={{ textIndent: "0px", padding: "0px" }}
            >
              {question.questionText}

              <OakP $mv="space-between-s" $font="body-2-bold">
                {question.answer}
              </OakP>
            </OakLI>
          ))}
        </OakOL>
      </OakFlex>
    </OakFlex>
  );
};
