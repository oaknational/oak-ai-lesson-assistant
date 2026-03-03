"use client";

import { OakBox, OakP, OakSpan } from "@oaknational/oak-components";

interface NoChangesAdaptationProps {
  reasoning?: string;
}

export function NoChangesAdaptation({ reasoning }: NoChangesAdaptationProps) {
  return (
    <OakBox
      $borderRadius="border-radius-s"
      $pa="spacing-12"
      className="bg-green-50"
    >
      <OakP $font="body-3">
        <OakSpan $font="body-3-bold">No changes </OakSpan>
        {reasoning}
      </OakP>
    </OakBox>
  );
}
