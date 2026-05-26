"use client";

import { OakBox, OakFlex, OakLink, OakP } from "@oaknational/oak-components";

interface SlidesTabProps {
  presentationId: string;
  presentationUrl: string;
}

export function SlidesTab({ presentationId, presentationUrl }: SlidesTabProps) {
  return (
    <OakFlex $height="100%" $flexDirection="column" $gap="spacing-16">
      <OakFlex $justifyContent="flex-end">
        <OakLink
          href={presentationUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in Google Slides ↗
        </OakLink>
      </OakFlex>

      <OakBox $width="100%" $height="100%" $borderRadius="border-radius-m">
        <iframe
          src={`https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false`}
          className="h-full min-h-[500px] w-full rounded-lg border border-gray-200"
          allowFullScreen
          title="Lesson Slides"
        />
      </OakBox>

      <OakP $font="body-4" $color="text-subdued">
        Presentation ID: {presentationId}
      </OakP>
    </OakFlex>
  );
}
