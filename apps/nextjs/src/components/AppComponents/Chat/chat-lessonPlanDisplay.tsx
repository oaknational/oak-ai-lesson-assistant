import { useEffect, useMemo, useState } from "react";

import type {
  BasedOnOptional,
  LessonPlanKeys,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import { Flex, Text } from "@radix-ui/themes";
import { cva } from "class-variance-authority";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { allSectionsInOrder } from "@/lib/lessonPlan/sectionsInOrder";
import { slugToSentenceCase } from "@/utils/toSentenceCase";

import Skeleton from "../common/Skeleton";
import DropDownSection from "./drop-down-section";
import { GuidanceRequired } from "./guidance-required";

const log = aiLogger("lessons");

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

export function notEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined && value !== "";
}

function basedOnTitle(basedOn: string | BasedOnOptional) {
  if (typeof basedOn === "object") {
    return basedOn.title;
  }
  return basedOn;
}

const displayStyles = cva(
  "relative flex flex-col space-y-10 px-14 pb-28 opacity-100 sm:px-24",
);

export type LessonPlanDisplayProps = Readonly<{
  chatEndRef: React.MutableRefObject<HTMLDivElement | null>;
  sectionRefs: Record<string, React.MutableRefObject<HTMLDivElement | null>>;
  documentContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  showLessonMobile: boolean;
}>;

export const LessonPlanDisplay = ({
  chatEndRef,
  showLessonMobile,
}: {
  chatEndRef: React.MutableRefObject<HTMLDivElement | null>;
  showLessonMobile: boolean;
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [sectionsToDisplay, setSectionsToDisplay] = useState<LessonPlanKeys[]>(
    [],
  );
  const chat = useLessonChat();

  const handleSetIsOpen = (section: string, isOpen: boolean) => {
    setOpenSections((prevState) => ({
      ...prevState,
      [section]: isOpen,
    }));
  };

  const {
    lessonPlan: chatLessonPlan,
    ailaStreamingStatus,
    lastModeration,
    streamingSection,
    streamingSections,
    setSectionRef,
  } = chat;

  const lessonPlan = useMemo(() => {
    const lessonPlanWithExperimentalQuiz: LooseLessonPlan = {
      ...chatLessonPlan,
      starterQuiz:
        chat.lessonPlan._experimental_starterQuizMathsV0 ||
        chat.lessonPlan.starterQuiz,
      exitQuiz:
        chat.lessonPlan._experimental_exitQuizMathsV0 ||
        chat.lessonPlan.exitQuiz,
    };
    return lessonPlanWithExperimentalQuiz;
  }, [
    chatLessonPlan,
    chat.lessonPlan._experimental_starterQuizMathsV0,
    chat.lessonPlan.starterQuiz,
    chat.lessonPlan._experimental_exitQuizMathsV0,
    chat.lessonPlan.exitQuiz,
  ]);

  const lessonPlanSectionKeys = useMemo(
    () =>
      Object.keys(lessonPlan).filter(
        (key) =>
          allSectionsInOrder.includes(key as LessonPlanKeys) && lessonPlan[key],
      ) as LessonPlanKeys[],
    [lessonPlan],
  );

  // If a section is temporarily missing, we don't suddenly
  // hide the section until it appears again
  useEffect(() => {
    const newSectionsToDisplay = [
      ...new Set([...lessonPlanSectionKeys, ...(streamingSections ?? [])]),
    ];

    setSectionsToDisplay((prevSectionsToDisplay) => {
      const updatedSections = [
        ...new Set([...prevSectionsToDisplay, ...newSectionsToDisplay]),
      ];
      // Only cause a component update if something has changed
      if (
        JSON.stringify(updatedSections) !==
        JSON.stringify(prevSectionsToDisplay)
      ) {
        return updatedSections;
      }
      return prevSectionsToDisplay;
    });
  }, [lessonPlanSectionKeys, streamingSections]);

  useEffect(() => {
    log.info("Sections to display", sectionsToDisplay);
  }, [sectionsToDisplay]);

  useEffect(() => {
    const initialOpenSections = sectionsToDisplay.reduce(
      (acc, section) => ({
        ...acc,
        [section]: showLessonMobile,
      }),
      {},
    );
    setOpenSections(initialOpenSections);
  }, [sectionsToDisplay, showLessonMobile]);

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
      {lessonPlan.title && (
        <Flex direction="column" gap="2">
          <Flex direction="row" gap="2" className="opacity-90">
            {notEmpty(lessonPlan.keyStage) && (
              <Text className="font-bold">
                {slugToSentenceCase(lessonPlan.keyStage ?? "")}
              </Text>
            )}
            <span>•</span>
            {notEmpty(lessonPlan.subject) && (
              <Text className="font-bold">
                {slugToSentenceCase(lessonPlan.subject ?? "")}
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
        {allSectionsInOrder.map((section) => (
          <DropDownSection
            key={section}
            section={section}
            value={lessonPlan[section]}
            isOpen={openSections[section] || !showLessonMobile}
            setIsOpen={handleSetIsOpen}
            ailaStreamingStatus={ailaStreamingStatus}
            streamingSection={streamingSection}
            visible={sectionsToDisplay.includes(section)}
            setSectionRef={setSectionRef}
          />
        ))}
      </div>
      <div ref={chatEndRef} />
    </div>
  );
};

export default LessonPlanDisplay;
