"use client";

import {
  OakBox,
  OakFlex,
  OakHeading,
  OakLoadingSpinner,
  OakP,
  OakTagFunctional,
} from "@oaknational/oak-components";
import Image from "next/image";

export const SLIDE_TYPE_SUMMARIES: Record<string, string> = {
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

export function formatSlideType(slideType: string): string {
  return slideType
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase());
}

export type SlidePlan = {
  isDeleted: boolean;
  source: "ai" | "user";
  reasoning?: string;
} | null;

export function getSummary(
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

export type AdaptSlideCardProps = {
  title: string;
  isDeleted?: boolean;
  thumbnailUrl?: string;
  thumbnailsLoading?: boolean;
  children?: React.ReactNode;
};

export function AdaptSlideCard({
  title,
  isDeleted,
  thumbnailUrl,
  thumbnailsLoading,
  children,
}: AdaptSlideCardProps) {
  return (
    <OakBox
      $borderRadius="border-radius-m"
      $background={!isDeleted ? "white" : "grey20"}
      $ba="border-solid-m"
      $borderColor={!isDeleted ? "border-primary" : "border-neutral-lighter"}
    >
      <OakBox $pa="spacing-16">
        <OakFlex
          $justifyContent="space-between"
          $alignItems="center"
          $flexDirection={"row"}
        >
          <OakFlex $justifyContent="center" $alignItems="center">
            <OakHeading tag="h3" $font="heading-7" $mr={"spacing-16"}>
              {title}
            </OakHeading>
            {isDeleted !== undefined && (
              <OakTagFunctional
                $color={"black"}
                $background={!isDeleted ? "mint" : "grey30"}
                label={isDeleted ? "Excluded" : "Included"}
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
                  alt={`${title} thumbnail`}
                  fill
                  className="object-contain"
                  loading="lazy"
                />
              </OakFlex>
            )}
          </OakBox>
          <OakFlex $flexDirection="column" $pa="spacing-16" $gap="spacing-12">
            {children}
          </OakFlex>
        </OakFlex>
      </OakBox>
    </OakBox>
  );
}
