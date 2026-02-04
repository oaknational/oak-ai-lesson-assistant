import type { ComprehensionTask as ComprehensionTaskType } from "@oakai/teaching-materials/src/documents/teachingMaterials/comprehension/schema";

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
    <OakFlex $gap={"spacing-16"} $flexDirection="column" $width="100%">
      <OakBox $mt="spacing-12">
        <OakFlex $flexDirection="column">
          <OakP $font="body-2-bold">
            {generation.comprehension.instructions}
          </OakP>
        </OakFlex>
      </OakBox>
      <OakBox $mt="spacing-16">
        {generation.comprehension.text.split("\n\n").map((paragraph, index) => (
          <OakP
            $font="body-2"
            key={`${paragraph.trim().slice(0, 8)}-${index}`}
            $mb="spacing-12"
          >
            {paragraph.trim()}
          </OakP>
        ))}
      </OakBox>
      <OakHeading $font={"heading-6"} tag="h3" $mt="spacing-24">
        Questions
      </OakHeading>
      <OakFlex $gap={"spacing-16"} $flexDirection="column">
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
      <OakHeading $font={"heading-6"} tag="h3" $mt="spacing-24">
        Answers
      </OakHeading>
      <OakFlex $gap={"spacing-16"} $flexDirection="column">
        <OakOL>
          {generation.comprehension.questions.map((question, index) => (
            <OakLI
              $pa={"spacing-0"}
              key={`${index}-${question.questionText}`}
              $font="body-2"
              style={{ textIndent: "0px", padding: "0px" }}
            >
              {question.questionText}

              <OakP $mv="spacing-16" $font="body-2-bold">
                {question.answer}
              </OakP>
            </OakLI>
          ))}
        </OakOL>
      </OakFlex>
    </OakFlex>
  );
};
