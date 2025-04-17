import { useRef } from "react";

import { rawQuizFixture } from "@oakai/aila/src/protocol/rawQuizSchema";
import type {
  LessonPlanKey,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { sectionToMarkdown } from "@oakai/aila/src/protocol/sectionToMarkdown";

import { MathJax } from "better-react-mathjax";

import { lessonSectionTitlesAndMiniDescriptions } from "@/data/lessonSectionTitlesAndMiniDescriptions";

import LessonOverviewQuizContainer from "./Quiz/LessonOverviewQuizContainer";
import { notEmpty } from "./chat-lessonPlanDisplay";
import { sectionTitle } from "./drop-down-section/sectionTitle";
import { MemoizedReactMarkdownWithStyles } from "./markdown";

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

const LessonPlanMapToMarkDown = ({
  lessonPlan,
  sectionRefs,
}: {
  lessonPlan: LooseLessonPlan;
  sectionRefs?: Record<string, React.MutableRefObject<HTMLDivElement | null>>;
}) => {
  const {
    _experimental_starterQuizMathsV0,
    _experimental_exitQuizMathsV0,
    _experimental_starterQuizMathsV1,
    _experimental_exitQuizMathsV1,
    ...restOfLessonPlan
  } = lessonPlan;
  const lessonPlanWithExperiments: LooseLessonPlan = {
    ...restOfLessonPlan,
    starterQuiz:
      lessonPlan._experimental_starterQuizMathsV0 ?? lessonPlan.starterQuiz,
    exitQuiz: lessonPlan._experimental_exitQuizMathsV0 ?? lessonPlan.exitQuiz,
  };
  const coreComponents = Object.entries(lessonPlanWithExperiments)
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
        "_experimental_starterQuizMathsV1",
        "cycle1",
        "cycle2",
        "cycle3",
        "exitQuiz",
        "_experimental_exitQuizMathsV1",
        "additionalMaterials",
      ];
      return (
        order.indexOf(a as LessonPlanKey) - order.indexOf(b as LessonPlanKey)
      );
    })
    .map(({ key, value }) => {
      console.log(key);
      if (
        key === "_experimental_starterQuizMathsV1" ||
        key === "_experimental_exitQuizMathsV1"
      ) {
        return (
          <LessonOverviewQuizContainer
            key={key}
            questions={value ?? rawQuizFixture}
            imageAttribution={[]}
            isMathJaxLesson={true}
          />
        );
      }
      return (
        <ChatSection
          key={key}
          sectionRefs={sectionRefs}
          objectKey={key}
          value={value}
        />
      );
    });

  return coreComponents;
};

export default LessonPlanMapToMarkDown;

export interface ChatSectionProps {
  sectionRefs?: Record<string, React.MutableRefObject<HTMLDivElement | null>>;
  objectKey: LessonPlanKey;
  value: unknown;
}

const ChatSection = ({
  sectionRefs,
  objectKey,
  value,
}: Readonly<ChatSectionProps>) => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  if (sectionRefs) sectionRefs[objectKey] = sectionRef;

  return (
    <div ref={sectionRef}>
      <MathJax hideUntilTypeset="every" dynamic>
        <MemoizedReactMarkdownWithStyles
          lessonPlanSectionDescription={
            lessonSectionTitlesAndMiniDescriptions[objectKey]?.description
          }
          markdown={`# ${sectionTitle(objectKey)}
${sectionToMarkdown(objectKey, value)}`}
        />
      </MathJax>
    </div>
  );
};
