"use client";

import {
  OakBox,
  OakFlex,
  OakHeading,
  OakLI,
  OakLoadingSpinner,
  OakOL,
  OakP,
  OakSpan,
  OakTagFunctional,
} from "@oaknational/oak-components";
import Image from "next/image";

const SLIDE_TYPE_SUMMARIES: Record<string, string> = {
  title:
    "Title slide: This slide introduces the lesson title and the unit it belongs to. The learning outcome is introduced later.",
  lessonOutcome:
    "Lesson outcome: This slide enables pupils to understand the aim and purpose of their learning.",
  keywords:
    "Keywords: This slide introduces the keywords taught in the lesson. They are taught in context throughout the lesson.",
  lessonOutline:
    "Lesson outline: This slide allows pupils to understand the structure of the lesson and their learning.",
  explanation:
    "Explanation: This slide teaches the key learning points and keywords pupils need to meet the learning outcome.",
  checkForUnderstanding:
    "Check for understanding: This slide provides the opportunity to check pupils' understanding of what has been explained.",
  practice:
    "Practice: This slide provides the opportunity for pupils to practise their knowledge of the key learning points.",
  summary: "Summary: This slide summarises the key learning from the lesson.",
  feedback:
    "Feedback: This slide provides feedback to pupils on their learning.",
  endOfLesson: "End of lesson: This slide marks the end of the lesson.",
};

function formatSlideType(slideType: string): string {
  return slideType
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase());
}

export type SlidePlan = {
  isDeleted: boolean;
  source: "ai" | "user";
  reasoning?: string;
} | null;

export type AdaptSlideCardProps = {
  slide: {
    slideNumber: number;
    slideId: string;
    slideTitle?: string;
    slideType: string;
    keyLearningPoints?: string[];
  };
  thumbnailUrl: string | undefined;
  thumbnailsLoading?: boolean;
  slidePlan?: SlidePlan;
};

function getSummary(
  plan: SlidePlan | undefined,
  slideType: string,
): React.ReactNode {
  if (!plan)
    return <OakP $font="body-3">{SLIDE_TYPE_SUMMARIES[slideType]}</OakP>;

  if (plan.isDeleted) {
    return <OakP $font="body-3">{plan.reasoning}</OakP>;
  }

  if (plan.reasoning) {
    return <OakP $font="body-3">{plan.reasoning}</OakP>;
  }

  return null;
}

export function AdaptSlideCard({
  slide,
  thumbnailUrl,
  thumbnailsLoading,
  slidePlan,
}: AdaptSlideCardProps) {
  const title = slide.slideTitle ?? formatSlideType(slide.slideType);

  return (
    <OakBox
      $borderRadius="border-radius-m"
      $background={!slidePlan?.isDeleted ? "white" : "grey20"}
      $ba="border-solid-m"
      $borderColor={"border-primary"}
    >
      <OakBox $pa="spacing-16">
        <OakFlex
          $justifyContent="space-between"
          $alignItems="center"
          $flexDirection={"row"}
        >
          <OakFlex $justifyContent="center" $alignItems="center">
            <OakHeading tag="h3" $font="heading-7" $mr={"spacing-16"}>
              {slide.slideNumber}: {title}
            </OakHeading>
            {slidePlan && (
              <OakTagFunctional
                $color={"black"}
                $background={!slidePlan.isDeleted ? "mint" : "grey30"}
                label={slidePlan.isDeleted ? "Excluded" : "Included"}
                $font={"body-4"}
              />
            )}
          </OakFlex>
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
            {getSummary(slidePlan, slide.slideType)}
            {slide.keyLearningPoints && slide.keyLearningPoints.length > 0 && (
              <OakBox
                $mt="spacing-16"
                $borderRadius="border-radius-s"
                $ba="border-solid-s"
                $borderColor="border-neutral-lighter"
                $pa="spacing-12"
                $background={slidePlan?.isDeleted ? "grey10" : "white"}
              >
                <OakP $font="body-2" $mb="spacing-4">
                  <OakSpan $font="body-3-bold">Key learning points:</OakSpan>
                </OakP>
                <OakOL $ml="spacing-16">
                  {slide.keyLearningPoints.map((point, i) => (
                    <OakLI key={i} $font="body-3">
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
