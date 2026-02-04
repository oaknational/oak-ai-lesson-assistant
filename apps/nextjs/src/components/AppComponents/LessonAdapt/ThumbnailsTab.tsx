"use client";

import { useState } from "react";

import {
  OakBox,
  OakFlex,
  OakHeading,
  OakLoadingSpinner,
  OakP,
} from "@oaknational/oak-components";
import Image from "next/image";

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

const THUMBNAIL_SIZES =
  "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw";

export function ThumbnailsTab({
  thumbnails,
  isLoading,
  error,
}: ThumbnailsTabProps) {
  const [failedThumbnails, setFailedThumbnails] = useState<
    Record<string, boolean>
  >({});
  const resolvedThumbnails = thumbnails ?? [];
  const thumbnailsCount = thumbnails?.length ?? 0;
  const hasThumbnails = thumbnailsCount > 0;
  const showEmptyState = Array.isArray(thumbnails) && thumbnails.length === 0;

  const handleThumbnailError = (objectId: string) => {
    setFailedThumbnails((prev) =>
      prev[objectId] ? prev : { ...prev, [objectId]: true },
    );
  };

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

      {hasThumbnails && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {resolvedThumbnails.map((thumbnail) => (
            <OakBox
              key={thumbnail.objectId}
              $borderRadius="border-radius-m"
              className="overflow-hidden border border-gray-200"
            >
              <OakFlex $flexDirection="column">
                {failedThumbnails[thumbnail.objectId] ? (
                  <div className="flex aspect-video w-full items-center justify-center bg-gray-50 text-sm text-gray-500">
                    Thumbnail unavailable
                  </div>
                ) : (
                  <div className="relative aspect-video w-full bg-white">
                    <Image
                      src={thumbnail.thumbnailUrl}
                      alt={`Slide ${thumbnail.slideIndex + 1}`}
                      fill
                      sizes={THUMBNAIL_SIZES}
                      className="object-contain"
                      loading="lazy"
                      onError={() => handleThumbnailError(thumbnail.objectId)}
                    />
                  </div>
                )}
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

      {showEmptyState && (
        <OakP $font="body-3" $color="text-subdued">
          No slides found in this presentation.
        </OakP>
      )}
    </OakFlex>
  );
}
