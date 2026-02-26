"use client";

import { OakBox, OakFlex, OakHeading, OakP } from "@oaknational/oak-components";

interface KeyLearningPointsProps {
  keyLearningPoints: string[];
  selectedKlps: string[];
}

export function KeyLearningPoints({
  keyLearningPoints,
  selectedKlps,
}: KeyLearningPointsProps) {
  return (
    <OakBox $mb="spacing-48">
      <OakHeading tag="h3" $font="heading-6" $mb="spacing-8">
        Key learning points
      </OakHeading>
      <OakFlex
        $font="body-3"
        $flexDirection="column"
        $gap="spacing-4"
        $pa={"spacing-16"}
        $background={"grey10"}
      >
        {keyLearningPoints.map((point, index) => (
          <OakP key={index}>
            {index + 1}. {point}
          </OakP>
        ))}
      </OakFlex>
      {selectedKlps.length < keyLearningPoints.length && (
        <div className="border-amber-400 bg-amber-50 mt-4 rounded border-l-4 p-4">
          <OakP $font="body-3" $color="text-primary">
            If you select only {selectedKlps.length} key learning{" "}
            {selectedKlps.length === 1 ? "point" : "points"} to teach, the
            lesson outcome may not be achieved.
          </OakP>
        </div>
      )}
    </OakBox>
  );
}
