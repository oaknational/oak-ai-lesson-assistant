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

// Fixture data
const FIXTURE_DATA: LessonDetailsData = {
  learningOutcome:
    "I can describe the location of Liverpool and justify, using evidence, why it is an important city both nationally and globally.",
  learningCycles: [
    "Describing Liverpool's location from maps",
    "National importance of Liverpool",
    "Global importance of Liverpool",
  ],
  keyLearningPoints: [
    "Liverpool is a coastal city in the north-west of the UK.",
    "Evidence of Liverpool's importance can be categorised into historical, socio-economic, demographic and economic.",
    "Liverpool is nationally important for its diversity, city economy, role in the Industrial Revolution and population.",
    "Liverpool is globally important for trade, sporting and cultural events and its link to the slave trade and migration.",
  ],
  keywords: [
    {
      keyword: "Location",
      definition:
        "where a place is in relation to other features, for example, physical landforms and transport links",
    },
    {
      keyword: "National",
      definition: "relating to a country",
    },
    {
      keyword: "Global",
      definition: "relating to the whole world",
    },
  ],
  misconceptions: [
    {
      misconception: "Liverpool is in the south of England",
      description:
        "Liverpool is actually in the north-west of England, not the south.",
    },
    {
      misconception: "Liverpool is only important because of The Beatles",
      description:
        "While The Beatles are significant, Liverpool has historical importance for trade, the Industrial Revolution, and its diverse population.",
    },
  ],
};

export function LessonDetailsTab({
  data = FIXTURE_DATA,
}: LessonDetailsTabProps) {
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
