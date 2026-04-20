"use client";

import { OakFlex, OakHeading } from "@oaknational/oak-components";

import { CommonMisconception } from "./CommonMisconception";
import { KeyLearningPoints } from "./KeyLearningPoints";
import { Keywords } from "./Keywords";

interface LessonDetailsCardProps {
  keyLearningPoints: string[];
  keywords: Array<{ keyword: string; definition: string }>;
  misconceptions: Array<{ misconception: string; description: string }>;
  selectedKlps: string[];
}

export function LessonDetailsCard({
  keyLearningPoints,
  keywords,
  misconceptions,
  selectedKlps,
}: Readonly<LessonDetailsCardProps>) {
  return (
    <OakFlex
      $borderRadius="border-radius-m"
      $borderColor="border-neutral-lighter"
      $pa="spacing-24"
      $flexDirection={"column"}
      $background={"white"}
      $ba="border-solid-m"
    >
      <OakHeading tag="h2" $font="heading-5" $mb="spacing-24">
        Lesson details
      </OakHeading>
      <KeyLearningPoints
        keyLearningPoints={keyLearningPoints}
        selectedKlps={selectedKlps}
      />
      <Keywords keywords={keywords} />
      {misconceptions.map((misconception, index) => (
        <CommonMisconception
          key={`${misconception.misconception}-${index}`}
          misconception={misconception}
        />
      ))}
    </OakFlex>
  );
}
