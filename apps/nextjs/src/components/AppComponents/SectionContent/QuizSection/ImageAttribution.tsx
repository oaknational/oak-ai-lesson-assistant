import { useMemo } from "react";

import type { QuizV2 } from "@oakai/aila/src/protocol/schema";
import { OakBox, OakSpan } from "@oaknational/oak-components";

export type ImageAttributionProps = {
  quiz: QuizV2;
};

export const ImageAttribution = ({ quiz }: ImageAttributionProps) => {
  const attributions = useMemo(() => {
    return quiz.questions.flatMap((question, index) =>
      (question.imageAttributions ?? []).map((imgAttr) => ({
        questionNumber: index + 1,
        attribution: imgAttr.attribution,
      }))
    );
  }, [quiz.questions]);

  if (attributions.length === 0) {
    return null;
  }

  return (
    <OakBox $mt="space-between-m" $color="text-subdued">
      {attributions.map((attr, index) => (
        <OakSpan key={`image-attr-${index}`}>
          <OakSpan $font="body-3-bold">Q{attr.questionNumber}. </OakSpan>
          <OakSpan $font="body-3">{attr.attribution} </OakSpan>
        </OakSpan>
      ))}
    </OakBox>
  );
};