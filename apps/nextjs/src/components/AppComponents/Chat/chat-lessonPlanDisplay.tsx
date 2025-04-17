import { useCallback, useEffect, useRef, useState } from "react";

import type {
  BasedOnOptional,
  LessonPlanKey,
} from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";

import { Flex, Text } from "@radix-ui/themes";
import { cva } from "class-variance-authority";
import scrollIntoView from "scroll-into-view-if-needed";

import { allSectionsInOrder } from "@/lib/lessonPlan/sectionsInOrder";
import {
  useChatStore,
  useLessonPlanActions,
  useLessonPlanStore,
  useModerationStore,
} from "@/stores/AilaStoresProvider";
import { slugToSentenceCase } from "@/utils/toSentenceCase";

import Skeleton from "../common/Skeleton";
import LessonOverviewQuizContainer from "./Quiz/LessonOverviewQuizContainer";
import { GuidanceRequired } from "./guidance-required";
import { LessonPlanSection } from "./lesson-plan-section";

const scrollingLog = aiLogger("lessons:scrolling");

export function notEmpty(value: unknown) {
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
  documentContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  showLessonMobile: boolean;
}>;

const useSectionScrolling = ({
  sectionRefs,
  documentContainerRef,
  userHasCancelledAutoScroll,
}: {
  sectionRefs: Record<string, React.MutableRefObject<HTMLDivElement | null>>;
  documentContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  userHasCancelledAutoScroll: boolean;
}) => {
  const scrollToSection = useLessonPlanStore((state) => state.scrollToSection);
  const { setScrollToSection } = useLessonPlanActions();
  const lastScrollToSectionRef = useRef<LessonPlanKey | null>(null);

  useEffect(() => {
    if (scrollToSection === null) {
      lastScrollToSectionRef.current = scrollToSection;
      return;
    }

    const isSectionChanged = lastScrollToSectionRef.current !== scrollToSection;
    if (isSectionChanged) {
      const sectionRef = sectionRefs[scrollToSection];
      if (sectionRef) {
        scrollingLog.info(`Scrolling to ${scrollToSection}`);
        setTimeout(() => {
          if (sectionRef.current) {
            // Use ponyfill for safari support
            scrollIntoView(sectionRef.current, {
              behavior: "smooth",
              block: "start",
            });
          }
          setScrollToSection(null);
        }, 20);
      }
      lastScrollToSectionRef.current = scrollToSection;
    }
  }, [
    scrollToSection,
    sectionRefs,
    documentContainerRef,
    userHasCancelledAutoScroll,
    setScrollToSection,
  ]);
};

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
      if (event?.type === "wheel") {
        scrollingLog.info("User cancelled auto scroll");
        setUserHasCancelledAutoScroll(true);
      }
    };

    if (ailaStreamingStatus === "Idle") {
      // hack to account for lag
      const timer = setTimeout(() => {
        scrollingLog.info("Enabling auto scroll");
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
  documentContainerRef,
  showLessonMobile,
}: LessonPlanDisplayProps) => {
  const lessonPlan = useLessonPlanStore((state) => state.lessonPlan);
  const lastModeration = useModerationStore((state) => state.lastModeration);

  const { userHasCancelledAutoScroll } =
    useDetectScrollOverride(documentContainerRef);

  const titleSectionRef = useRef(null);
  const sectionRefs = useRef<
    Partial<
      Record<LessonPlanKey, React.MutableRefObject<HTMLDivElement | null>>
    >
  >({ title: titleSectionRef });
  const setSectionRef = useCallback(
    (
      key: LessonPlanKey,
      ref: React.MutableRefObject<HTMLDivElement | null>,
    ) => {
      sectionRefs.current[key] = ref;
    },
    [sectionRefs],
  );

  useSectionScrolling({
    sectionRefs: sectionRefs.current,
    documentContainerRef,
    userHasCancelledAutoScroll,
  });

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
        <Flex
          direction="column"
          gap="2"
          ref={titleSectionRef}
          style={{
            scrollMarginTop: 100,
          }}
        >
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
        {allSectionsInOrder.map((section) => {
          return (
            <LessonPlanSection
              key={section}
              sectionKey={section}
              setSectionRef={setSectionRef}
              showLessonMobile={showLessonMobile}
            />
          );
        })}
        <h2>Starter quiz RAW</h2>
        {lessonPlan._experimental_starterQuizMathsV1 && (
          <LessonOverviewQuizContainer
            key={"_experimental_starterQuizMathsV1"}
            questions={lessonPlan._experimental_starterQuizMathsV1}
            imageAttribution={[]}
            isMathJaxLesson={true}
          />
        )}{" "}
        <h2>Exit quiz RAW</h2>
        {lessonPlan._experimental_exitQuizMathsV1 && (
          <LessonOverviewQuizContainer
            key={"_experimental_exitQuizMathsV1"}
            questions={lessonPlan._experimental_exitQuizMathsV1}
            imageAttribution={[]}
            isMathJaxLesson={true}
          />
        )}
      </div>
      <div ref={chatEndRef} />
    </div>
  );
};

export default LessonPlanDisplay;
