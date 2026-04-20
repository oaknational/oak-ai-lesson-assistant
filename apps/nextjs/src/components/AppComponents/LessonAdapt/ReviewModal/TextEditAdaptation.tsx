"use client";

import {
  OakBox,
  OakCheckBox,
  OakFlex,
  OakP,
  OakSpan,
} from "@oaknational/oak-components";

interface TextEditAdaptationProps {
  changeId: string;
  originalText: string;
  newText?: string;
  isApproved: boolean;
  onToggle: () => void;
}

export function TextEditAdaptation({
  changeId,
  originalText,
  newText,
  isApproved,
  onToggle,
}: Readonly<TextEditAdaptationProps>) {
  return (
    <OakFlex
      $borderRadius="border-radius-s"
      $pa="spacing-12"
      $alignItems="center"
      $gap="spacing-12"
      className="bg-yellow-50"
    >
      <OakBox className="flex-grow">
        <OakP $font="body-3">
          <OakSpan className="line-through opacity-60">{originalText}</OakSpan>
        </OakP>
        {newText && <OakP $font="body-3-bold">{newText}</OakP>}
      </OakBox>
      <OakFlex $alignItems="center" $gap="spacing-8" className="shrink-0">
        <OakCheckBox
          id={changeId}
          value={"Accept"}
          checked={isApproved}
          onChange={onToggle}
          $font={"body-3"}
        />
      </OakFlex>
    </OakFlex>
  );
}
