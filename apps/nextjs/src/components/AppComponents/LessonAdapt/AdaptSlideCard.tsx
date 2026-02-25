"use client";

import type { SlidesAgentResponse } from "@oakai/lesson-adapters";

import {
  OakBox,
  OakCheckBox,
  OakFlex,
  OakHeading,
  OakLI,
  OakLoadingSpinner,
  OakOL,
  OakP,
  OakSpan,
} from "@oaknational/oak-components";
import Image from "next/image";
import { ta } from "zod/v4/locales";

const SLIDE_TYPE_SUMMARIES: Record<string, string> = {
  title:
    "This slide introduces the lesson title and the unit it belongs to. The learning outcome is introduced later.",
  lessonOutcome:
    "This slide enables pupils to understand the aim and purpose of their learning.",
  keywords:
    "This slide introduces the keywords taught in the lesson. They are taught in context throughout the lesson.",
  lessonOutline:
    "This slide allows pupils to understand the structure of the lesson and their learning.",
  explanation:
    "This slide teaches the key learning points and keywords pupils need to meet the learning outcome.",
  checkForUnderstanding:
    "This slide provides the opportunity to check pupils' understanding of what has been explained.",
  practice:
    "This slide provides the opportunity for pupils to practise their knowledge of the key learning points.",
  summary: "This slide summarises the key learning from the lesson.",
  endOfLesson: "This slide marks the end of the lesson.",
};

function formatSlideType(slideType: string): string {
  return slideType
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase());
}

const THUMBNAIL_SIZES =
  "(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 100vw";

export type AdaptSlideCardProps = {
  slide: {
    slideNumber: number;
    slideId: string;
    slideTitle?: string;
    slideType: string;
    keyLearningPoints?: string[];
    slideToKeep?: boolean;
    slideToDelete?: boolean;
  };
  thumbnailUrl: string | undefined;
  thumbnailsLoading?: boolean;
  isIncluded: boolean;
  slidePlan?:
    | ({ slideId: string } & {
        textEdits: SlidesAgentResponse["changes"]["textEdits"] | undefined;
      } & {
        deleted:
          | SlidesAgentResponse["changes"]["slideDeletions"][number]
          | undefined;
      } & {
        tableCellEdits:
          | SlidesAgentResponse["changes"]["tableCellEdits"]
          | undefined;
      } & {
        slideToKeep:
          | SlidesAgentResponse["changes"]["slidesToKeep"][number]
          | undefined;
      })
    | null
    | undefined;
};
const getSummary = (
  changes: AdaptSlideCardProps["slidePlan"] | undefined,
): React.ReactNode => {
  if (!changes) return undefined;
  if (changes?.deleted) {
    return (
      <OakP $font="body-1">
        <OakSpan $font="body-1-bold">Excluded:</OakSpan>{" "}
        {changes.deleted.reasoning}
      </OakP>
    );
  }

  if (changes?.slideToKeep) {
    return (
      <OakP $font="body-1">
        <OakSpan $font="body-1-bold">Included:</OakSpan>{" "}
        {changes.slideToKeep.reasoning}
      </OakP>
    );
  }

  return null;
};

export function AdaptSlideCard({
  slide,
  thumbnailUrl,
  thumbnailsLoading,
  slidePlan,
}: AdaptSlideCardProps) {
  const title = slide.slideTitle ?? formatSlideType(slide.slideType);
  const summary = SLIDE_TYPE_SUMMARIES[slide.slideType];

  console.log("Slide changes for slide", slide.slideNumber, slidePlan);

  return (
    <OakBox
      $borderRadius="border-radius-m"
      $background={"white"}
      $ba="border-solid-m"
      $borderColor={"border-primary"}
    >
      <OakBox $pa="spacing-16">
        <OakFlex $justifyContent="space-between" $alignItems="center">
          <OakHeading tag="h3" $font="heading-6">
            {slide.slideNumber}: {title}{" "}
            {slidePlan ? (slide.slideToDelete ? `Excluded` : `Included`) : ``}
          </OakHeading>
        </OakFlex>

        <OakFlex
          $bt="border-solid-s"
          $borderColor="border-neutral-lighter"
          $flexDirection={["column", "row"]}
          $gap="spacing-12"
          $mt="spacing-16"
        >
          <OakBox>
            {thumbnailsLoading && (
              <OakFlex $alignItems="center">
                <OakLoadingSpinner />
                <OakP $font="body-2">Loading thumbnail...</OakP>
              </OakFlex>
            )}
            {thumbnailUrl && (
              <OakFlex
                $width={"spacing-360"}
                $height={"spacing-240"}
                $position="relative"
                $flexDirection={"row"}
              >
                <Image
                  src={thumbnailUrl}
                  alt={`Slide ${slide.slideNumber} thumbnail`}
                  fill
                  className="object-contain"
                  loading="lazy"
                />
              </OakFlex>
            )}
          </OakBox>
          <OakFlex $flexDirection="column" $pa="spacing-16" $gap="spacing-12">
            {getSummary(slidePlan) || summary}
            {slide.keyLearningPoints && slide.keyLearningPoints.length > 0 && (
              <OakBox
                $mt="spacing-16"
                $borderRadius="border-radius-s"
                $ba="border-solid-s"
                $borderColor="border-neutral-lighter"
                $pa="spacing-12"
                $background={slide.slideToDelete ? "grey10" : "white"}
              >
                <OakP $font="body-2" $mb="spacing-4">
                  <OakSpan $font="body-1-bold">Key learning points:</OakSpan>
                </OakP>
                <OakOL $ml="spacing-16">
                  {slide.keyLearningPoints.map((point, i) => (
                    <OakLI key={i} $font="body-2">
                      {point}
                    </OakLI>
                  ))}
                </OakOL>
              </OakBox>
            )}
          </OakFlex>
        </OakFlex>
      </OakBox>
    </OakBox>
  );
}
