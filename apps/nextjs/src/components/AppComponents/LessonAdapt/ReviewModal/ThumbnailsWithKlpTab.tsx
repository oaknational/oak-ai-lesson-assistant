"use client";

import { useState } from "react";

import {
  OakBox,
  OakFlex,
  OakLoadingSpinner,
  OakP,
} from "@oaknational/oak-components";
import Image from "next/image";

import type { SlideKlpMapping, Thumbnail } from "./types";

interface ThumbnailsWithKlpTabProps {
  thumbnails: Thumbnail[] | null | undefined;
  slideKlpMappings: SlideKlpMapping[];
}

const THUMBNAIL_SIZES =
  "(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 100vw";

export function ThumbnailsWithKlpTab({
  thumbnails,
  slideKlpMappings,
}: ThumbnailsWithKlpTabProps) {
  const [failedThumbnails, setFailedThumbnails] = useState<
    Record<string, boolean>
  >({});

  const handleThumbnailError = (objectId: string) => {
    setFailedThumbnails((prev) =>
      prev[objectId] ? prev : { ...prev, [objectId]: true },
    );
  };

  if (!thumbnails) {
    return (
      <OakFlex
        $alignItems="center"
        $justifyContent="center"
        $gap="spacing-8"
        $pa="spacing-24"
      >
        <OakLoadingSpinner />
        <OakP $font="body-3">Loading thumbnails...</OakP>
      </OakFlex>
    );
  }

  if (thumbnails.length === 0) {
    return (
      <OakP $font="body-3" $color="text-subdued">
        No slides found in this presentation.
      </OakP>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {thumbnails.map((thumbnail) => {
        // Find the KLP mapping for this slide (slideIndex is 0-based, slideNumber is 1-based)
        const mapping = slideKlpMappings.find(
          (m) => m.slideNumber === thumbnail.slideIndex + 1,
        );
        const klps = mapping?.keyLearningPoints ?? [];
        const learningCycles = mapping?.learningCycles ?? [];
        const coversDiversity = mapping?.coversDiversity ?? false;

        return (
          <OakFlex
            key={thumbnail.objectId}
            $flexDirection="column"
            $gap="spacing-8"
          >
            {/* Thumbnail */}
            <OakBox
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
                    $font="body-3-bold"
                    $color="text-subdued"
                    $textAlign="center"
                  >
                    Slide {thumbnail.slideIndex + 1}
                  </OakP>
                </OakBox>
              </OakFlex>
            </OakBox>

            {/* Info Card */}
            <OakBox
              $background="bg-decorative2-subdued"
              $pa="spacing-12"
              $borderRadius="border-radius-s"
            >
              {/* Key Learning Points */}
              {klps.length > 0 && (
                <OakBox $mb="spacing-12">
                  <OakP $font="body-3-bold" $mb="spacing-8">
                    Key Learning Points:
                  </OakP>
                  <OakFlex $flexDirection="column" $gap="spacing-8">
                    {klps.map((klp, index) => (
                      <OakFlex key={index} $gap="spacing-8" $alignItems="start">
                        <OakBox
                          $background="bg-primary"
                          $borderRadius="border-radius-circle"
                          className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center"
                        >
                          <OakP $font="body-4" $color="white">
                            {index + 1}
                          </OakP>
                        </OakBox>
                        <OakP $font="body-3">{klp}</OakP>
                      </OakFlex>
                    ))}
                  </OakFlex>
                </OakBox>
              )}

              {/* Learning Cycles */}
              {learningCycles.length > 0 && (
                <OakBox $mb="spacing-12">
                  <OakP $font="body-3-bold" $mb="spacing-8">
                    Learning Cycles:
                  </OakP>
                  <OakFlex $flexDirection="column" $gap="spacing-8">
                    {learningCycles.map((cycle, index) => (
                      <OakFlex key={index} $gap="spacing-8" $alignItems="start">
                        <OakBox
                          $background="bg-decorative1-main"
                          $borderRadius="border-radius-circle"
                          className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center"
                        >
                          <OakP $font="body-4" $color="white">
                            {index + 1}
                          </OakP>
                        </OakBox>
                        <OakP $font="body-3">{cycle}</OakP>
                      </OakFlex>
                    ))}
                  </OakFlex>
                </OakBox>
              )}

              {/* Diversity Badge */}
              {coversDiversity && (
                <OakBox
                  $background="bg-decorative4-main"
                  $pa="spacing-8"
                  $borderRadius="border-radius-s"
                >
                  <OakP $font="body-3-bold" $color="white">
                    ✓ Covers Diversity Content
                  </OakP>
                </OakBox>
              )}

              {/* No content indicator */}
              {klps.length === 0 &&
                learningCycles.length === 0 &&
                !coversDiversity && (
                  <OakP $font="body-3" $color="text-subdued">
                    No key learning points, learning cycles, or diversity
                    content on this slide
                  </OakP>
                )}
            </OakBox>
          </OakFlex>
        );
      })}
    </div>
  );
}
