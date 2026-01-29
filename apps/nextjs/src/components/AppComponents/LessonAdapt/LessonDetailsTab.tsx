"use client";

import {
  OakBox,
  OakFlex,
  OakHeading,
  OakLI,
  OakOL,
  OakP,
  OakSpan,
} from "@oaknational/oak-components";

interface LessonDetailsData {
  learningOutcome: string;
  learningCycles: string[];
  keyLearningPoints: string[];
  keywords: Array<{
    keyword: string;
    definition: string;
  }>;
  misconceptions: Array<{
    misconception: string;
    description: string;
  }>;
}

interface LessonDetailsTabProps {
  data?: LessonDetailsData;
}

export function LessonDetailsTab({ data }: LessonDetailsTabProps) {
  if (!data) {
    return (
      <OakP $font="body-3" $color="text-subdued">
        No lesson details available.
      </OakP>
    );
  }
  return (
    <OakFlex $flexDirection="column" $gap="spacing-48" $mt="spacing-24">
      {/* Learning outcome */}
      <OakBox>
        <OakHeading tag="h2" $font="heading-5" $mb="spacing-16">
          Learning outcome
        </OakHeading>
        <OakP $font="body-1">{data.learningOutcome}</OakP>
      </OakBox>

      {/* Learning cycles */}
      <OakBox>
        <OakHeading tag="h2" $font="heading-5" $mb="spacing-16">
          Learning cycles
        </OakHeading>
        <OakBox $maxWidth="spacing-640">
          <OakOL $ml="spacing-16">
            {data.learningCycles.map((cycle, index) => (
              <OakLI key={index} $font="body-1" $mv="spacing-8">
                {cycle}
              </OakLI>
            ))}
          </OakOL>
        </OakBox>
      </OakBox>

      {/* Key learning points */}
      <OakBox>
        <OakHeading tag="h2" $font="heading-5" $mb="spacing-16">
          Key learning points
        </OakHeading>
        <OakBox $maxWidth="spacing-640">
          <OakOL $ml="spacing-16">
            {data.keyLearningPoints.map((point, index) => (
              <OakLI key={index} $font="body-1" $mv="spacing-8">
                {point}
              </OakLI>
            ))}
          </OakOL>
        </OakBox>
      </OakBox>

      {/* Keywords */}
      <OakBox>
        <OakHeading tag="h2" $font="heading-5" $mb="spacing-16">
          Keywords
        </OakHeading>
        <OakFlex
          $flexDirection="column"
          $gap="spacing-4"
          $maxWidth="spacing-640"
        >
          {data.keywords.map((keyword, index) => (
            <OakP key={index} $font="body-1">
              <OakSpan $font="body-1-bold">{keyword.keyword}</OakSpan> -{" "}
              {keyword.definition}
            </OakP>
          ))}
        </OakFlex>
      </OakBox>

      {/* Misconceptions */}
      {data.misconceptions.length > 0 && (
        <OakBox>
          <OakHeading tag="h2" $font="heading-5" $mb="spacing-16">
            Misconceptions
          </OakHeading>
          <OakFlex
            $flexDirection="column"
            $gap="spacing-4"
            $maxWidth="spacing-640"
          >
            {data.misconceptions.map((item, index) => (
              <OakP key={index} $font="body-1">
                <OakSpan $font="body-1-bold">{item.misconception}</OakSpan> -{" "}
                {item.description}
              </OakP>
            ))}
          </OakFlex>
        </OakBox>
      )}
    </OakFlex>
  );
}
