"use client";

import {
  OakBox,
  OakCheckBox,
  OakFlex,
  OakP,
  OakSpan,
} from "@oaknational/oak-components";

interface SlideDeleteAdaptationProps {
  changeId: string;
  reasoning: string;
  isApproved: boolean;
  onToggle: () => void;
}

export function SlideDeleteAdaptation({
  changeId,
  reasoning,
  isApproved,
  onToggle,
}: Readonly<SlideDeleteAdaptationProps>) {
  return (
    <OakFlex
      $borderRadius="border-radius-s"
      $pa="spacing-12"
      $alignItems="center"
      $gap="spacing-12"
      className="bg-pink-50"
    >
      <OakBox className="flex-grow">
        <OakP $font="body-3">
          <OakSpan $font="body-3-bold">Remove slide </OakSpan>
          {reasoning}
        </OakP>
      </OakBox>
      <OakFlex $alignItems="center" $gap="spacing-8" className="shrink-0">
        <OakCheckBox
          id={changeId}
          value={"Accept"}
          checked={isApproved}
          onChange={onToggle}
        />
      </OakFlex>
    </OakFlex>
  );
}
