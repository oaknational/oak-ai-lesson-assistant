import { useEffect, useMemo, useState } from "react";

import {
  BasedOnOptional,
  LessonPlanKeys,
} from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import { Flex, Text } from "@radix-ui/themes";
import { cva } from "class-variance-authority";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { organiseSections } from "@/lib/lessonPlan/organiseSections";
import { allSectionsInOrder } from "@/lib/lessonPlan/sectionsInOrder";

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

function getSectionsToDisplay(
  lessonPlanKeys: LessonPlanKeys[],
  streamingSections: LessonPlanKeys[] | undefined,
) {
  const sectionsFromOrganiseSections = organiseSections.flatMap((section) => {
    const trigger = section.trigger;
    if (
      lessonPlanKeys.includes(trigger) ||
      streamingSections?.includes(trigger)
    ) {
      return section.dependants.filter(
        (dependant) =>
          streamingSections?.includes(dependant) ||
          lessonPlanKeys.includes(dependant as LessonPlanKeys),
      );
    }
    return [];
  });

  const sectionsFromAllSectionsInOrder = allSectionsInOrder.filter((section) =>
    lessonPlanKeys.includes(section as LessonPlanKeys),
  );

  const sectionsToDisplay = [
    ...new Set([
      ...sectionsFromOrganiseSections,
      ...sectionsFromAllSectionsInOrder,
    ]),
  ];
  return sectionsToDisplay;
}

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

  const handleSetIsOpen = (section: string, isOpen: boolean) => {
    setOpenSections((prevState) => ({
      ...prevState,
      [section]: isOpen,
    }));
  };

  const chat = useLessonChat();
  const {
    lessonPlan,
    ailaStreamingStatus,
    lastModeration,
    streamingSection,
    streamingSections,
    setSectionRef,
  } = chat;

  const lessonPlanSectionKeys = useMemo(
    () =>
      Object.keys(lessonPlan).filter((key) =>
        allSectionsInOrder.includes(key as LessonPlanKeys),
      ) as LessonPlanKeys[],
    [lessonPlan],
  );

  // If a section is temporarily missing, we don't suddenly
  // hide the section until it appears again
  useEffect(() => {
    const newSectionsToDisplay = getSectionsToDisplay(
      lessonPlanSectionKeys,
      streamingSections,
    );
    setSectionsToDisplay((prevSectionsToDisplay) => {
      const updatedSections = [
        ...new Set([...prevSectionsToDisplay, ...newSectionsToDisplay]),
      ];
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
    log.info("No lesson plan. Rendering skeleton");
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
