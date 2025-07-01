import { useRef } from "react";

import type {
  LessonPlanKey,
  LessonPlanSectionWhileStreaming,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import {
  convertQuizV1ToV2,
  detectQuizVersion,
} from "@oakai/aila/src/protocol/schemas/quiz/conversion/quizV1ToV2";

import * as Tooltip from "@radix-ui/react-tooltip";
import { Box, Flex } from "@radix-ui/themes";

import { lessonSectionTitlesAndMiniDescriptions } from "@/data/lessonSectionTitlesAndMiniDescriptions";

import { notEmpty } from "./Chat/chat-lessonPlanDisplay";
import { sectionTitle } from "./Chat/drop-down-section/sectionTitle";
import { SectionContent } from "./SectionContent";

const excludedKeys = [
  "title",
  "keyStage",
  "subject",
  "topic",
  "basedOn",
  "lessonReferences",
] as const;
type ExcludedKeys = (typeof excludedKeys)[number];
type ValidLessonPlanKey = Exclude<LessonPlanKey, ExcludedKeys>;

const StaticLessonPlanRenderer = ({
  lessonPlan,
  sectionRefs,
}: {
  lessonPlan: LooseLessonPlan;
  sectionRefs?: Record<string, React.MutableRefObject<HTMLDivElement | null>>;
}) => {
  const {
    _experimental_starterQuizMathsV0,
    _experimental_exitQuizMathsV0,
    ...restOfLessonPlan
  } = lessonPlan;
  // Convert experimental V1 quizzes to V2 format if needed
  const starterQuiz = lessonPlan._experimental_starterQuizMathsV0
    ? convertQuizV1ToV2(lessonPlan._experimental_starterQuizMathsV0)
    : lessonPlan.starterQuiz;

  const exitQuiz = lessonPlan._experimental_exitQuizMathsV0
    ? convertQuizV1ToV2(lessonPlan._experimental_exitQuizMathsV0)
    : lessonPlan.exitQuiz;

  const lessonPlanWithExperiments: LooseLessonPlan = {
    ...restOfLessonPlan,
    starterQuiz,
    exitQuiz,
  };
  return Object.entries(lessonPlanWithExperiments)
    .filter(
      (
        entry,
      ): entry is [
        ValidLessonPlanKey,
        NonNullable<LooseLessonPlan[ValidLessonPlanKey]>,
      ] => {
        const [k] = entry;
        return !excludedKeys.includes(k as ExcludedKeys);
      },
    )
    .filter(([_, v]) => notEmpty(v))
    .map(([key, value]) => {
      return { key, value };
    })
    .sort(({ key: a }, { key: b }) => {
      // sort the keys in a predefined order
      //  title, subject, topic, keyStage, basedOn, lessonReferences, learningOutcome, learningCycles, priorKnowledge, keyLearningPoints, misconceptions, keywords, starterQuiz, cycle1, cycle2, cycle3, exitQuiz, additionalMaterials
      const order: LessonPlanKey[] = [
        "learningOutcome",
        "learningCycles",
        "priorKnowledge",
        "keyLearningPoints",
        "misconceptions",
        "keywords",
        "starterQuiz",
        "cycle1",
        "cycle2",
        "cycle3",
        "exitQuiz",
        "additionalMaterials",
      ];
      return (
        order.indexOf(a as LessonPlanKey) - order.indexOf(b as LessonPlanKey)
      );
    })
    .map(({ key, value }) => {
      return (
        <StaticSection
          key={key}
          sectionRefs={sectionRefs}
          objectKey={key}
          value={value}
        />
      );
    });
};

export default StaticLessonPlanRenderer;

export interface StaticSectionProps {
  sectionRefs?: Record<string, React.MutableRefObject<HTMLDivElement | null>>;
  objectKey: LessonPlanKey;
  value: LessonPlanSectionWhileStreaming;
}

// Rendered in static contexts like the share page
export const StaticSection = ({
  sectionRefs,
  objectKey,
  value,
}: Readonly<StaticSectionProps>) => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  if (sectionRefs) sectionRefs[objectKey] = sectionRef;

  const title = sectionTitle(objectKey);
  const sectionDescription = sectionTitle(
    lessonSectionTitlesAndMiniDescriptions[objectKey].description,
  );

  return (
    <div ref={sectionRef}>
      <Flex align="center" gap="3" className="mt-20">
        <Box>
          <h2 className="mb-0 mt-0 text-xl font-bold">{title}</h2>
        </Box>
        <Tooltip.Provider delayDuration={0}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Box className="mb-0 mt-0">
                <button className="my-0 flex h-[24px] w-[24px] items-center justify-center overflow-hidden rounded-full bg-black p-4">
                  <span className="p-3 text-xs text-white">i</span>
                </button>
              </Box>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="max-w-[300px] rounded-lg bg-black p-7 text-center text-sm text-white"
                sideOffset={5}
              >
                {sectionDescription}
                <Tooltip.Arrow className="TooltipArrow" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </Flex>

      <SectionContent sectionKey={objectKey} value={value} />
    </div>
  );
};
