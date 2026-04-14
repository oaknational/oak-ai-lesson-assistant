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
  title: "This slide shows the lesson title and the unit it belongs to.",
  lessonOutcome: "This slide introduces pupils to the lesson's aim.",
  keywords:
    "This slide introduces pupils to the tier 3 and tier 2 vocabulary that will be taught in the lesson.",
  lessonOutline:
    "This slide provides an overview of the structure of the lesson.  It appears at the beginning of each section.",
  explanation: "This slide teaches and models the knowledge in the lesson",
  checkForUnderstanding:
    "This slide checks pupils’ understanding of the knowledge taught",
  practice:
    "This slide provides the opportunity for pupils to practise new knowledge",
  summary: "This slide summarises the key learning from the lesson.",
  feedback:
    "This slide provides an opportunity to check pupils’ understanding and address misconceptions.",
  endOfLesson: "End of lesson: This slide marks the end of the lesson.",
};

export function formatSlideType(slideType: string): string {
  const spaced = slideType.replaceAll(/([A-Z])/g, " $1").toLowerCase();
  return spaced.slice(0, 1).toUpperCase() + spaced.slice(1);
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
}: Readonly<AdaptSlideCardProps>) {
  return (
    <OakBox
      $borderRadius="border-radius-m"
      $background={isDeleted ? "grey20" : "white"}
      $ba="border-solid-m"
      $borderColor={isDeleted ? "border-neutral-lighter" : "border-primary"}
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
                $background={isDeleted ? "grey30" : "mint"}
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
                $mv={"spacing-16"}
                $width={"spacing-360"}
                $position="relative"
                $flexDirection={"row"}
                style={{ aspectRatio: "16 / 9" }}
              >
                <Image
                  style={{ border: "solid #cacaca 0.5px" }}
                  src={thumbnailUrl}
                  alt={`${title} thumbnail`}
                  fill
                  className="object-fit"
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
