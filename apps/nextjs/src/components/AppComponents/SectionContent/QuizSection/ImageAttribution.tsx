import { useMemo } from "react";

import type { QuizV2, QuizV2Question } from "@oakai/aila/src/protocol/schema";
import { OakBox, OakSpan } from "@oaknational/oak-components";

export type ImageAttributionProps = {
  quiz: QuizV2;
};

function getUniqueAttributions(question: QuizV2Question): string[] {
  if (!question.imageAttributions || question.imageAttributions.length === 0) {
    return [];
  }
  
  return Array.from(
    new Set(question.imageAttributions.map((attr) => attr.attribution))
  );
}

export const ImageAttribution = ({ quiz }: ImageAttributionProps) => {
  const questionsWithAttributions = useMemo(() => {
    return quiz.questions
      .map((question, index) => ({
        questionNumber: index + 1,
        attributions: getUniqueAttributions(question),
      }))
      .filter((item) => item.attributions.length > 0);
  }, [quiz.questions]);

  if (questionsWithAttributions.length === 0) {
    return null;
  }

  return (
    <OakBox $mt="space-between-m" $color="text-subdued">
      {questionsWithAttributions.map(({ questionNumber, attributions }) => (
        <OakBox key={`question-${questionNumber}-attributions`}>
          <OakSpan $font="body-3-bold">Q{questionNumber}. </OakSpan>
          {attributions.map((attribution, index) => (
            <OakSpan key={`attr-${index}`} $font="body-3">
              {attribution}
              {index < attributions.length - 1 && " "}
            </OakSpan>
          ))}
        </OakBox>
      ))}
    </OakBox>
  );
};