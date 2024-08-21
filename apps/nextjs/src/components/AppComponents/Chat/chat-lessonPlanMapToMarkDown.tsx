import { useRef } from "react";

import { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { sectionToMarkdown } from "@oakai/aila/src/protocol/sectionToMarkdown";
import { lessonSectionTitlesAndMiniDescriptions } from "data/lessonSectionTitlesAndMiniDescriptions";

import { humanizeCamelCaseString } from "./chat-dropdownsection";
import { notEmpty } from "./chat-lessonPlanDisplay";
import { MemoizedReactMarkdownWithStyles } from "./markdown";

const LessonPlanMapToMarkDown = ({
  lessonPlan,
  sectionRefs,
}: {
  lessonPlan: LooseLessonPlan;
  sectionRefs?: Record<string, React.MutableRefObject<HTMLDivElement | null>>;
}) => {
  return (
    Object.entries(lessonPlan)
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
        const order = [
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
        return order.indexOf(a) - order.indexOf(b);
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
  if (!!sectionRefs) sectionRefs[objectKey] = sectionRef;

  return (
    <div ref={sectionRef}>
      <MemoizedReactMarkdownWithStyles
        lessonPlanSectionDescription={
          lessonSectionTitlesAndMiniDescriptions[objectKey]?.description
        }
        markdown={`# ${objectKey.includes("cycle") ? "Cycle " + objectKey.split("cycle")[1] : humanizeCamelCaseString(objectKey)}
${sectionToMarkdown(objectKey, value)}`}
      />
    </div>
  );
};
