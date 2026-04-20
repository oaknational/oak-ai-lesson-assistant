"use client";

import { OakBox, OakHeading, OakP, OakSpan } from "@oaknational/oak-components";

interface CommonMisconceptionProps {
  misconception: { misconception: string; description: string } | undefined;
}

export function CommonMisconception({
  misconception,
}: Readonly<CommonMisconceptionProps>) {
  if (!misconception) return null;

  return (
    <OakBox>
      <OakHeading tag="h3" $font="heading-6" $mb="spacing-16">
        Common misconception
      </OakHeading>
      <OakP $font="body-3" $mb="spacing-4">
        <OakSpan $font="body-3-bold">{misconception.misconception}</OakSpan>
      </OakP>
      <OakP $font="body-3">{misconception.description}</OakP>
    </OakBox>
  );
}
