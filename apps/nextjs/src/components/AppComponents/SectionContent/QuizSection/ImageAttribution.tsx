import { useMemo } from "react";

import type { QuizV2 } from "@oakai/aila/src/protocol/schema";

import { OakBox, OakSpan } from "@oaknational/oak-components";

import { getQuestionsWithAttributions } from "./imageAttributionUtils";

export type ImageAttributionProps = {
  quiz: QuizV2;
};

export const ImageAttribution = ({ quiz }: ImageAttributionProps) => {
  const questionsWithAttributions = useMemo(() => {
    return getQuestionsWithAttributions(quiz.questions, quiz.imageAttributions);
  }, [quiz.questions, quiz.imageAttributions]);

  if (questionsWithAttributions.length === 0) {
    return null;
  }

  return (
    <OakBox $mt="space-between-m" $color="text-subdued">
      <OakSpan $font="body-3">
        {questionsWithAttributions.map(
          ({ questionNumber, attributions }, qIndex) => (
            <span key={`question-${questionNumber}`}>
              <OakSpan $font="body-3-bold">{questionNumber}. </OakSpan>
              {attributions.join(", ")}
              {qIndex < questionsWithAttributions.length - 1 && ", "}
            </span>
          ),
        )}
        .
      </OakSpan>
    </OakBox>
  );
};
