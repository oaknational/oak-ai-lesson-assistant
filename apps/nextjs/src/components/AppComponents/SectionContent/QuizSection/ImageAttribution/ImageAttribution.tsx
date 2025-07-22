import { useMemo } from "react";

import type { QuizV2 } from "@oakai/aila/src/protocol/schema";

import { OakBox, OakSpan } from "@oaknational/oak-components";

import { getFormattedAttributions } from "./imageAttributionUtils";

export type ImageAttributionProps = {
  quiz: QuizV2;
};

export const ImageAttribution = ({ quiz }: ImageAttributionProps) => {
  const groupedAttributions = useMemo(
    () => getFormattedAttributions(quiz.questions, quiz.imageAttributions),
    [quiz.questions, quiz.imageAttributions],
  );

  if (groupedAttributions.length === 0) {
    return null;
  }

  return (
    <OakBox $mt="space-between-m" $color="text-subdued">
      <OakSpan $font="body-3">
        {groupedAttributions.map(({ attribution, questionRange }, index) => (
          <span key={`attribution-${index}`}>
            © {attribution} ({questionRange})
            {index < groupedAttributions.length - 1 && "; "}
          </span>
        ))}
        .
      </OakSpan>
    </OakBox>
  );
};
