import { useRef } from "react";

import type {
  LessonPlanKey,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { sectionToMarkdown } from "@oakai/aila/src/protocol/sectionToMarkdown";

import { MathJax } from "better-react-mathjax";

import { lessonSectionTitlesAndMiniDescriptions } from "@/data/lessonSectionTitlesAndMiniDescriptions";

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _experimental_starterQuizMathsV0,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _experimental_exitQuizMathsV0,
    ...restOfLessonPlan
  } = lessonPlan;
  const lessonPlanWithExperiments: LooseLessonPlan = {
    ...restOfLessonPlan,
    starterQuiz:
      lessonPlan._experimental_starterQuizMathsV0 ?? lessonPlan.starterQuiz,
    exitQuiz: lessonPlan._experimental_exitQuizMathsV0 ?? lessonPlan.exitQuiz,
  };
  return (
    Object.entries(lessonPlanWithExperiments)
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          <ChatSection
            key={key}
            sectionRefs={sectionRefs}
            objectKey={key}
            value={value}
          />
        );
      })
  );
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
      <MathJax>
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
