import { useRef } from "react";

import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { sectionToMarkdown } from "@oakai/aila/src/protocol/sectionToMarkdown";
import { lessonSectionTitlesAndMiniDescriptions } from "data/lessonSectionTitlesAndMiniDescriptions";

import { allSectionsInOrder } from "@/lib/lessonPlan/sectionsInOrder";

import { notEmpty } from "./chat-lessonPlanDisplay";
import { sectionTitle } from "./drop-down-section";
import { MemoizedReactMarkdownWithStyles } from "./markdown";

const LessonPlanMapToMarkDown = ({
  lessonPlan,
  sectionRefs,
}: {
  lessonPlan: LooseLessonPlan;
  sectionRefs?: Record<string, React.MutableRefObject<HTMLDivElement | null>>;
}) => {
  const lessonPlanWithExperiments = {
    ...lessonPlan,
    starterQuiz:
      lessonPlan._experimental_starterQuizMathsV0 ?? lessonPlan.starterQuiz,
    exitQuiz: lessonPlan._experimental_exitQuizMathsV0 ?? lessonPlan.exitQuiz,
  };
  return (
    Object.entries(lessonPlanWithExperiments)
      .filter(([k]) => k !== "title")
      .filter(([k]) => k !== "keyStage")
      .filter(([k]) => k !== "subject")
      .filter(([k]) => k !== "topic")
      .filter(([k]) => k !== "basedOn")
      .filter(([k]) => k !== "lessonReferences")
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, v]) => notEmpty(v))
      .map(([key, value]) => {
        return { key, value };
      })
      .sort(({ key: a }, { key: b }) => {
        // sort the keys in a predefined order
        //  title, subject, topic, keyStage, basedOn, lessonReferences, learningOutcome, learningCycles, priorKnowledge, keyLearningPoints, misconceptions, keywords, starterQuiz, cycle1, cycle2, cycle3, exitQuiz, additionalMaterials
        const order = allSectionsInOrder;
        return (
          order.indexOf(a as (typeof order)[number]) -
          order.indexOf(b as (typeof order)[number])
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

const ChatSection = ({ sectionRefs, objectKey, value }) => {
  const sectionRef = useRef(null);
  if (sectionRefs) sectionRefs[objectKey] = sectionRef;

  return (
    <div ref={sectionRef}>
      <MemoizedReactMarkdownWithStyles
        lessonPlanSectionDescription={
          lessonSectionTitlesAndMiniDescriptions[objectKey]?.description
        }
        markdown={`# ${sectionTitle(objectKey)}
${sectionToMarkdown(objectKey, value)}`}
      />
    </div>
  );
};
