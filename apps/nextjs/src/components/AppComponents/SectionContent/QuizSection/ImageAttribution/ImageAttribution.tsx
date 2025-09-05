import { useMemo } from "react";

import type { QuizV2 } from "@oakai/aila/src/protocol/schema";
import { formatQuizAttributions } from "@oakai/exports/src/quiz-utils/attribution";

import { OakBox, OakSpan } from "@oaknational/oak-components";

export type ImageAttributionProps = {
  quiz: QuizV2;
};

export const ImageAttribution = ({ quiz }: ImageAttributionProps) => {
  const formattedAttribution = useMemo(
    () => formatQuizAttributions(quiz.questions, quiz.imageAttributions),
    [quiz.questions, quiz.imageAttributions],
  );

  if (formattedAttribution.segments.length === 0) {
    return null;
  }

  return (
    <OakBox $mt="space-between-m" $color="text-subdued">
      <OakSpan $font="body-3">
        {formattedAttribution.segments.map((segment, index) => (
          <OakSpan
            key={`segment-${index}`}
            $font={segment.bold ? "body-3-bold" : "body-3"}
          >
            {segment.text}
          </OakSpan>
        ))}
      </OakSpan>
    </OakBox>
  );
};
