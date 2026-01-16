"use client";

import {
  OakBox,
  OakFlex,
  OakHeading,
  OakLoadingSpinner,
  OakP,
} from "@oaknational/oak-components";

interface Thumbnail {
  objectId: string;
  slideIndex: number;
  thumbnailUrl: string;
  width: number;
  height: number;
}

interface ThumbnailsTabProps {
  thumbnails: Thumbnail[] | undefined;
  isLoading: boolean;
  error: { message: string } | null;
}

export function ThumbnailsTab({
  thumbnails,
  isLoading,
  error,
}: ThumbnailsTabProps) {
  return (
    <OakFlex $flexDirection="column" $gap="spacing-16" $mt="spacing-24">
      <OakHeading tag="h2" $font="heading-5">
        Slide Thumbnails
      </OakHeading>

      {isLoading && (
        <OakFlex
          $alignItems="center"
          $justifyContent="center"
          $gap="spacing-8"
          $pa="spacing-24"
        >
          <OakLoadingSpinner />
          <OakP $font="body-3">Loading thumbnails...</OakP>
        </OakFlex>
      )}

      {error && (
        <OakBox
          $pa="spacing-16"
          $background="bg-decorative5-subdued"
          $borderRadius="border-radius-m"
        >
          <OakP $font="body-3" $color="text-error">
            Failed to load thumbnails: {error.message}
          </OakP>
        </OakBox>
      )}

      {thumbnails && thumbnails.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {thumbnails.map((thumbnail) => (
            <OakBox
              key={thumbnail.objectId}
              $borderRadius="border-radius-m"
              className="overflow-hidden border border-gray-200"
            >
              <OakFlex $flexDirection="column">
                <img
                  src={thumbnail.thumbnailUrl}
                  alt={`Slide ${thumbnail.slideIndex + 1}`}
                  className="aspect-video w-full object-contain"
                  loading="lazy"
                />
                <OakBox $pa="spacing-8" $background="bg-neutral">
                  <OakP
                    $font="body-4"
                    $color="text-subdued"
                    $textAlign="center"
                  >
                    Slide {thumbnail.slideIndex + 1}
                  </OakP>
                </OakBox>
              </OakFlex>
            </OakBox>
          ))}
        </div>
      )}

      {thumbnails && thumbnails.length === 0 && (
        <OakP $font="body-3" $color="text-subdued">
          No slides found in this presentation.
        </OakP>
      )}
    </OakFlex>
  );
}
