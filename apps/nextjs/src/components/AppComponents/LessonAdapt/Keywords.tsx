"use client";

import {
  OakBox,
  OakFlex,
  OakHeading,
  OakP,
  OakSpan,
} from "@oaknational/oak-components";

interface KeywordsProps {
  keywords: Array<{ keyword: string; definition: string }>;
}

export function Keywords({ keywords }: KeywordsProps) {
  return (
    <OakBox $mb="spacing-48">
      <OakHeading tag="h3" $font="heading-6" $mb="spacing-16">
        Keywords
      </OakHeading>
      <OakFlex $flexDirection="column" $gap="spacing-4" $maxWidth="spacing-640">
        {keywords.map((kw, index) => (
          <OakP key={index} $font="body-3">
            <OakSpan $font="body-3-bold">{kw.keyword}</OakSpan> -{" "}
            {kw.definition}
          </OakP>
        ))}
      </OakFlex>
    </OakBox>
  );
}
