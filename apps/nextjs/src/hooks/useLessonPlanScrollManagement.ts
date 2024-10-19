import { useCallback, useEffect, useRef, useState } from "react";

import { LessonPlanKeys } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";

const log = aiLogger("lessons");

function findTopmostFixedParent(element: HTMLElement | null) {
  let topmostFixed: HTMLElement | null = null;

  while (element && element !== document.body) {
    if (element.classList.contains("fixed")) {
      topmostFixed = element;
    }
    element = element.parentElement;
  }

  return topmostFixed;
}

export const useLessonPlanScrollManagement = (
  streamingSection: LessonPlanKeys | undefined,
  streamingSectionCompleted: LessonPlanKeys | undefined,
) => {
  const [recentlyScrolledSection, setRecentlyScrolledSection] = useState<
    LessonPlanKeys | undefined
  >(undefined);

  const [userHasCancelledAutoScroll, setUserHasCancelledAutoScroll] =
    useState(false);

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

  const processScrollQueue = useCallback(() => {
    if (activeScrollRef.current || scrollQueueRef.current.length === 0) {
      return;
    }

    const section = scrollQueueRef.current.shift();
    activeScrollRef.current = section || null;

    if (section) {
      const sectionRef = sectionRefs.current[section];

      if (sectionRef && sectionRef.current) {
        const scrollableParent = document.querySelector(
          '[data-testid="chat-right-hand-side-lesson"]',
        ) as HTMLElement;

        if (scrollableParent && sectionRef.current) {
          const parentRect = scrollableParent.getBoundingClientRect();
          const sectionRect = sectionRef.current.getBoundingClientRect();
          const targetScrollPosition =
            sectionRect.top - parentRect.top + scrollableParent.scrollTop - 160;

          scrollableParent.scrollTo({
            top: targetScrollPosition,
            behavior: "smooth",
          });
        }
      }
    }
  }, []);

  const scrollToSection = useCallback(
    (section: LessonPlanKeys) => {
      if (section === recentlyScrolledSection) {
        log.info("Skipping scrolling: it's the recent section we scrolled to");
        return;
      }
      if (userHasCancelledAutoScroll) {
        log.info("Skipping scrolling: user has cancelled auto scroll");
        return;
      }

      scrollQueueRef.current.push(section);
      setRecentlyScrolledSection(section);
    },
    [userHasCancelledAutoScroll, recentlyScrolledSection],
  );

  useEffect(() => {
    const handleUserScroll = () => {
      setUserHasCancelledAutoScroll(true);

      const timeoutId = setTimeout(() => {
        setUserHasCancelledAutoScroll(false);
      }, 5000);

      return () => {
        clearTimeout(timeoutId);
      };
    };

    window.addEventListener("wheel", handleUserScroll);

    return () => {
      window.removeEventListener("wheel", handleUserScroll);
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (activeScrollRef.current) {
        activeScrollRef.current = null;
      } else {
        processScrollQueue();
      }
    }, 500);

    return () => {
      clearInterval(intervalId);
    };
  }, [processScrollQueue]);

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