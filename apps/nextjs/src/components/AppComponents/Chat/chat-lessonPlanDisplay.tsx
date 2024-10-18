import { useEffect, useState } from "react";

import {
  BasedOnOptional,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
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
  "relative flex flex-col space-y-10 px-14 pb-28 opacity-100 sm:px-24 ",
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

function getSectionsToDisplay(
  lessonPlan: LooseLessonPlan,
  streamingSections: string[] | undefined,
) {
  return organiseSections.flatMap((section) => {
    const trigger = lessonPlan[section.trigger];
    if (trigger || streamingSections?.includes(section.trigger)) {
      return section.dependants.filter(
        (dependant) =>
          streamingSections?.includes(dependant) ||
          (lessonPlan[dependant] !== null &&
            lessonPlan[dependant] !== undefined),
      );
    }
    return [];
  });
}

export const LessonPlanDisplay = ({
  chatEndRef,
  sectionRefs,
  documentContainerRef,
  showLessonMobile,
}: {
  chatEndRef: React.MutableRefObject<HTMLDivElement | null>;
  sectionRefs: Record<string, React.MutableRefObject<HTMLDivElement | null>>;
  documentContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  showLessonMobile: boolean;
}) => {
  const [lessonPlan, setLessonPlan] = useState<LooseLessonPlan>({});

  const chat = useLessonChat();
  const {
    lessonPlan: incomingLessonPlan,
    ailaStreamingStatus,
    lastModeration,
    streamingSections,
  } = chat;

  useEffect(() => {
    if (Object.keys(incomingLessonPlan).length > 0) {
      console.log("Update with incoming lesson plan", incomingLessonPlan);
      setLessonPlan(incomingLessonPlan);
    }
  }, [incomingLessonPlan]);

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

  const sectionsToDisplay = getSectionsToDisplay(lessonPlan, streamingSections);

  const [prevSectionsToDisplay, setPrevSectionsToDisplay] = useState<string[]>(
    [],
  );

  useEffect(() => {
    if (
      JSON.stringify(sectionsToDisplay) !==
      JSON.stringify(prevSectionsToDisplay)
    ) {
      console.log("Render LessonPlanDisplay with sections", sectionsToDisplay);
      setPrevSectionsToDisplay(sectionsToDisplay);
    }
  }, [sectionsToDisplay, prevSectionsToDisplay]);

  if (Object.keys(lessonPlan).length === 0) {
    console.log("Display Skeleton");
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
      {lessonPlan.title && (
        <Flex direction="column" gap="2">
          <Flex direction="row" gap="2" className="opacity-90">
            {notEmpty(lessonPlan.keyStage) && (
              <Text className="font-bold">
                {keyStageToTitle(lessonPlan.keyStage ?? "")}
              </Text>
            )}
            <span>•</span>
            {notEmpty(lessonPlan.subject) && (
              <Text className="font-bold">
                {subjectToTitle(lessonPlan.subject ?? "")}
              </Text>
            )}
          </Flex>
          <h1 className="text-2xl font-bold sm:pb-12 sm:pt-8 sm:text-4xl">
            {lessonPlan.title}
          </h1>{" "}
          {notEmpty(lessonPlan) && lessonPlan.topic !== lessonPlan.title && (
            <h2 className="text-lg font-bold placeholder-opacity-90">
              {lessonPlan.topic}
            </h2>
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
        {sectionsToDisplay.map((section) => (
          <DropDownSection
            key={section}
            objectKey={section}
            sectionRefs={sectionRefs}
            value={lessonPlan[section]}
            userHasCancelledAutoScroll={userHasCancelledAutoScroll}
            documentContainerRef={documentContainerRef}
            showLessonMobile={showLessonMobile}
          />
        ))}
      </div>
      <div ref={chatEndRef} />
    </div>
  );
};

export default LessonPlanDisplay;
