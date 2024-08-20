import { useEffect, useState } from "react";

import { BasedOnOptional } from "@oakai/aila/src/protocol/schema";
import { Flex, Text } from "@radix-ui/themes";
import { cva } from "class-variance-authority";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";

import Skeleton from "../common/Skeleton";
import DropDownSection from "./drop-down-section";
import { GuidanceRequired } from "./guidance-required";

// @todo move these somewhere more sensible
export function subjectToTitle(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function keyStageToTitle(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function notEmpty(value: any) {
  return ![null, undefined, ""].includes(value);
}

function basedOnTitle(basedOn: string | BasedOnOptional) {
  if (typeof basedOn === "object") {
    return basedOn.title;
  }
  return basedOn;
}

const displayStyles = cva(
  "relative flex flex-col space-y-10 px-24 pb-28 pt-29 opacity-100",
);

const organiseSections = [
  {
    trigger: "learningOutcome",
    dependants: ["learningOutcome", "learningCycles"],
  },
  {
    trigger: "priorKnowledge",
    dependants: [
      "priorKnowledge",
      "keyLearningPoints",
      "misconceptions",
      "keywords",
    ],
  },
  {
    trigger: "starterQuiz",
    dependants: ["starterQuiz", "cycle1", "cycle2", "cycle3", "exitQuiz"],
  },
  { trigger: "additionalMaterials", dependants: ["additionalMaterials"] },
];

export const LessonPlanDisplay = ({
  chatEndRef,
  sectionRefs,
  documentContainerRef,
}: {
  chatEndRef: React.MutableRefObject<HTMLDivElement | null>;
  sectionRefs: Record<string, React.MutableRefObject<HTMLDivElement | null>>;
  documentContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}) => {
  const chat = useLessonChat();
  const { lessonPlan, ailaStreamingStatus, lastModeration } = chat;

  const [userHasCancelledAutoScroll, setUserHasCancelledAutoScroll] =
    useState(false);

  useEffect(() => {
    const handleUserScroll = () => {
      // Check for mousewheel or touch pad scroll event
      event?.type === "wheel" && setUserHasCancelledAutoScroll(true);
    };

    if (ailaStreamingStatus === "Idle") {
      // hack to account for lag
      const timer = setTimeout(() => {
        setUserHasCancelledAutoScroll(false);
      }, 1000);
      return () => clearTimeout(timer);
    }

    const container = documentContainerRef.current;
    if (container) {
      container.addEventListener("wheel", handleUserScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleUserScroll);
      }
    };
  }, [
    ailaStreamingStatus,
    setUserHasCancelledAutoScroll,
    documentContainerRef,
  ]);

  if (Object.keys(lessonPlan).length === 0) {
    return (
      <div className="w-full gap-5 px-23 pt-26">
        <Skeleton loaded={false} numberOfRows={2}>
          <p>Generating lesson</p>
        </Skeleton>
      </div>
    );
  }

  return (
    <div className={displayStyles()}>
      {lessonPlan["title"] && (
        <Flex direction="column" gap="2">
          <Flex direction="row" gap="2">
            {notEmpty(lessonPlan.keyStage) && (
              <Text className="font-bold">
                {keyStageToTitle(lessonPlan.keyStage ?? "")}
              </Text>
            )}
            {notEmpty(lessonPlan.subject) && (
              <Text className="font-bold">
                {subjectToTitle(lessonPlan.subject ?? "")}
              </Text>
            )}
          </Flex>
          <h1 className="pb-12 pt-8 text-4xl font-bold">{lessonPlan.title}</h1>{" "}
          {notEmpty(lessonPlan) && lessonPlan.topic !== lessonPlan.title && (
            <h2 className="text-lg font-bold">{lessonPlan.topic}</h2>
          )}
        </Flex>
      )}
      {lastModeration && <GuidanceRequired moderation={lastModeration} />}

      {notEmpty(lessonPlan.basedOn) && (
        <Flex direction="row" gap="2" className="pb-12">
          <Text className="whitespace-nowrap font-bold">Based on:</Text>
          {lessonPlan.basedOn && (
            <Text>{basedOnTitle(lessonPlan.basedOn)}</Text>
          )}
        </Flex>
      )}

      <div className="flex w-full flex-col justify-center">
        {organiseSections.map((section) => {
          const trigger = lessonPlan[section.trigger];
          return (
            !!trigger &&
            section.dependants.map((dependant) => {
              const value = lessonPlan[dependant];
              if (value !== null && value !== undefined) {
                return (
                  <DropDownSection
                    key={dependant}
                    objectKey={dependant}
                    sectionRefs={sectionRefs}
                    value={value}
                    userHasCancelledAutoScroll={userHasCancelledAutoScroll}
                    documentContainerRef={documentContainerRef}
                  />
                );
              }
            })
          );
        })}
      </div>
      <div ref={chatEndRef} />
    </div>
  );
};

export default LessonPlanDisplay;
