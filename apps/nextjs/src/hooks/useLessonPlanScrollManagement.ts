import { useCallback, useEffect, useRef, useState } from "react";

import type { LessonPlanKeys } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";

import type { AilaStreamingStatus } from "@/components/AppComponents/Chat/Chat/hooks/useAilaStreamingStatus";

const log = aiLogger("lessons");

const SCROLLING_ENABLED = true;

export const useLessonPlanScrollManagement = (
  streamingSection: LessonPlanKeys | undefined,
  streamingSectionCompleted: LessonPlanKeys | undefined,
  streamingStatus: AilaStreamingStatus,
) => {
  const recentlyScrolledSectionRef = useRef<LessonPlanKeys | null>(null);
  const userHasCancelledAutoScrollRef = useRef(false);

  const sectionRefs = useRef<
    Record<LessonPlanKeys, React.MutableRefObject<HTMLDivElement | null>>
  >({
    title: { current: null },
    subject: { current: null },
    keyStage: { current: null },
    topic: { current: null },
    learningOutcome: { current: null },
    learningCycles: { current: null },
    priorKnowledge: { current: null },
    keyLearningPoints: { current: null },
    misconceptions: { current: null },
    keywords: { current: null },
    basedOn: { current: null },
    starterQuiz: { current: null },
    exitQuiz: { current: null },
    cycle1: { current: null },
    cycle2: { current: null },
    cycle3: { current: null },
    additionalMaterials: { current: null },
  });

  const setSectionRef = useCallback(
    (section: LessonPlanKeys, el: HTMLDivElement | null) => {
      sectionRefs.current[section].current = el;
    },
    [],
  );

  const scrollQueueRef = useRef<LessonPlanKeys[]>([]);
  const activeScrollRef = useRef<LessonPlanKeys | null>(null);

  // Scroll to a section based on the section key
  const performScrollToSection = useCallback((section: LessonPlanKeys) => {
    log.info("Perform scroll to section", section);
    const sectionRef = sectionRefs?.current[section];

    if (sectionRef?.current) {
      const scrollableParent = document.querySelector(
        '[data-testid="chat-right-hand-side-lesson"]',
      ) as HTMLElement;

      if (scrollableParent && sectionRef?.current) {
        activeScrollRef.current = section;
        const parentRect = scrollableParent.getBoundingClientRect();
        const sectionRect = sectionRef.current.getBoundingClientRect();
        const targetScrollPosition =
          sectionRect.top - parentRect.top + scrollableParent.scrollTop - 160;

        log.info("Scrolling to", section, targetScrollPosition);
        scrollableParent.scrollTo({
          top: targetScrollPosition,
          behavior: "smooth",
        });
        recentlyScrolledSectionRef.current = section;

        const handleScrollEnd = () => {
          if (activeScrollRef.current === section) {
            activeScrollRef.current = null;
          }
        };

        scrollableParent.addEventListener("scroll", handleScrollEnd);

        return () => {
          scrollableParent.removeEventListener("scroll", handleScrollEnd);
        };
      }
    }
  }, []);

  const processScrollQueue = useCallback(() => {
    if (scrollQueueRef.current.length === 0) {
      // There is nothing to scroll to
      //log.info("Skipping scroll - nothing to scroll to");
      return;
    }
    if (userHasCancelledAutoScrollRef.current) {
      // The user has scrolled manually
      return;
    }
    if (activeScrollRef.current) {
      log.info(
        "Skipping scroll - already scrolling to",
        activeScrollRef.current,
      );
      // We are in the middle of scrolling to a section
      return;
    }

    const section = scrollQueueRef.current.shift();

    if (section) {
      performScrollToSection(section);
    }
  }, [performScrollToSection]);

  // Trigger processing the scroll queue
  useEffect(() => {
    if (streamingStatus === "StreamingLessonPlan") {
      const intervalId = setInterval(() => {
        processScrollQueue();
      }, 200);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [processScrollQueue, streamingStatus]);

  const scrollToSection = useCallback(
    (section: LessonPlanKeys) => {
      if (!SCROLLING_ENABLED) {
        log.info("Skipping scrolling: scrolling is disabled");
        return;
      }
      if (section === recentlyScrolledSectionRef.current) {
        log.info("Skipping scrolling: it's the recent section we scrolled to");
        return;
      }

      scrollQueueRef.current.push(section);
      recentlyScrolledSectionRef.current = section;
    },
    [scrollQueueRef],
  );

  // Store the fact the user has scrolled
  const handleUserScroll = useCallback(() => {
    userHasCancelledAutoScrollRef.current = true;
  }, []);

  // Cancel the fact the user has scrolled after a delay
  useEffect(() => {
    const debounce = (func: () => void, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, delay);
      };
    };

    const debouncedReenableScroll = debounce(() => {
      log.info("Re-enabling auto scroll");
      userHasCancelledAutoScrollRef.current = false;
    }, 5000);

    window.addEventListener("wheel", () => {
      handleUserScroll();
      debouncedReenableScroll();
    });

    return () => {
      window.removeEventListener("wheel", handleUserScroll);
    };
  }, [handleUserScroll]);

  useEffect(() => {
    if (
      streamingSectionCompleted === undefined &&
      streamingSection !== undefined
    ) {
      // This is the first section being generated
      // so we scroll to it and show the user what is happening
      log.info("Scroll - first section", streamingSection);
      scrollToSection(streamingSection);
    } else if (
      streamingSectionCompleted !== undefined &&
      streamingSectionCompleted !== streamingSection
    ) {
      // We are moving to a new section but we don't want to show
      // this content until it is fully generated,
      // so we only scroll to it when it is completed
      log.info("Scroll - completed section", streamingSectionCompleted);
      scrollToSection(streamingSectionCompleted);
    }
  }, [streamingSection, streamingSectionCompleted, scrollToSection]);

  return { sectionRefs: sectionRefs.current, setSectionRef };
};
