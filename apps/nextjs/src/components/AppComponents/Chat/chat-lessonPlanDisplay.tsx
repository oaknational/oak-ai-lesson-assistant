import { useEffect, useMemo, useState } from "react";

import type { BasedOnOptional } from "@oakai/aila/src/protocol/schema";
import { Flex, Text } from "@radix-ui/themes";
import { cva } from "class-variance-authority";

import { organiseSections } from "@/lib/lessonPlan/organiseSections";
import { allSectionsInOrder } from "@/lib/lessonPlan/sectionsInOrder";
import {
  useChatStore,
  useModerationStore,
  useLessonPlanStore,
} from "@/stores/AilaStoresProvider";
import { slugToSentenceCase } from "@/utils/toSentenceCase";

import Skeleton from "../common/Skeleton";
import DropDownSection from "./drop-down-section";
import { GuidanceRequired } from "./guidance-required";

export function notEmpty(value: unknown) {
  return value !== null && value !== undefined && value !== "";
}

const shouldUseLessonPlanStore = true;

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

// TODO: replace with central scroll management
const useDetectScrollOverride = (
  documentContainerRef: React.RefObject<HTMLDivElement>,
) => {
  const ailaStreamingStatus = useChatStore(
    (state) => state.ailaStreamingStatus,
  );
  const [userHasCancelledAutoScroll, setUserHasCancelledAutoScroll] =
    useState(false);

  useEffect(() => {
    const handleUserScroll = (event: WheelEvent) => {
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
      container.addEventListener("wheel", handleUserScroll, { passive: true });
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

  return { userHasCancelledAutoScroll };
};

export const LessonPlanDisplay = ({
  chatEndRef,
  sectionRefs,
  documentContainerRef,
  showLessonMobile,
}: LessonPlanDisplayProps) => {
  const lessonPlanFromStore = useLessonPlanStore((state) => state.lessonPlan);
  const lastModeration = useModerationStore((state) => state.lastModeration);

  const lessonPlan = useMemo(
    () => ({
      ...lessonPlanFromStore,
      starterQuiz:
        lessonPlanFromStore._experimental_starterQuizMathsV0 ??
        lessonPlanFromStore.starterQuiz,
      exitQuiz:
        lessonPlanFromStore._experimental_exitQuizMathsV0 ??
        lessonPlanFromStore.exitQuiz,
    }),
    [lessonPlanFromStore],
  );

  const { userHasCancelledAutoScroll } =
    useDetectScrollOverride(documentContainerRef);

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
        {shouldUseLessonPlanStore
          ? allSectionsInOrder.map((section) => {
              return (
                <LessonPlanSection
                  key={section}
                  sectionKey={section}
                  sectionRefs={sectionRefs}
                  userHasCancelledAutoScroll={userHasCancelledAutoScroll}
                  documentContainerRef={documentContainerRef}
                  showLessonMobile={showLessonMobile}
                />
              );
            })
          : organiseSections.map((section) => {
              const trigger = lessonPlan[section.trigger];
              return (
                !!trigger &&
                section.dependants.map((dependant) => {
                  const value = lessonPlan[dependant];
                  if (value !== null && value !== undefined) {
                    return (
                      <DropDownSection
                        key={dependant}
                        section={dependant}
                        sectionRefs={sectionRefs}
                        value={value}
                        userHasCancelledAutoScroll={userHasCancelledAutoScroll}
                        documentContainerRef={documentContainerRef}
                        showLessonMobile={showLessonMobile}
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
