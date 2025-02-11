import { useEffect, useRef, useState } from "react";

import type {
  LessonPlanKey,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { OakBox, OakFlex, OakP } from "@oaknational/oak-components";
// import { equals } from "ramda";
import styled from "styled-components";

import { Icon } from "@/components/Icon";
import LoadingWheel from "@/components/LoadingWheel";
import { useLessonPlanStore } from "@/stores/AilaStoresProvider";
import { scrollToRef } from "@/utils/scrollToRef";

import Skeleton from "../../common/Skeleton";
import { LessonPlanSectionContent } from "../drop-down-section/lesson-plan-section-content";
import { sectionTitle } from "../drop-down-section/sectionTitle";

export type LessonPlanSectionProps = Readonly<{
  sectionKey: LessonPlanKey;
  sectionRefs: Record<string, React.MutableRefObject<HTMLDivElement | null>>;
  documentContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  userHasCancelledAutoScroll: boolean;
  showLessonMobile: boolean;
}>;

// TODO: move to selector?
const useGetStatus = (sectionKey: LessonPlanKey) => {
  const section = useLessonPlanStore((state) => state.lessonPlan[sectionKey]);
  const isStreaming = useLessonPlanStore(
    (state) =>
      state.sectionsToEdit.includes(sectionKey) &&
      !state.appliedPatchPaths.includes(sectionKey),
  );

  if (isStreaming) {
    return "streaming";
  }
  if (section) {
    return "loaded";
  }
  return "empty";
};

// TODO: move to central manager
const useScrollToSection = ({
  status,
  sectionRef,
  userHasCancelledAutoScroll,
  section,
  documentContainerRef,
}: {
  status: ReturnType<typeof useGetStatus>;
  sectionRef: React.MutableRefObject<HTMLDivElement | null>;
  userHasCancelledAutoScroll: boolean;
  section: LooseLessonPlan[keyof LooseLessonPlan];
  documentContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}) => {
  const sectionHasFiredRef = useRef(false);

  useEffect(() => {
    if (
      status === "streaming" &&
      section &&
      sectionHasFiredRef.current === false
    ) {
      function scrollToSection() {
        if (sectionRef && !userHasCancelledAutoScroll) {
          scrollToRef({
            ref: sectionRef,
            containerRef: documentContainerRef,
            duration: 1000,
          });
        }
        sectionHasFiredRef.current = true;
      }
      scrollToSection();
    }
  }, [
    section,
    sectionRef,
    sectionHasFiredRef,
    status,
    documentContainerRef,
    userHasCancelledAutoScroll,
  ]);
};

export const LessonPlanSection = ({
  sectionKey,
  sectionRefs,
  documentContainerRef,
  userHasCancelledAutoScroll,
  showLessonMobile,
}: LessonPlanSectionProps) => {
  const section = useLessonPlanStore((state) => state.lessonPlan[sectionKey]);
  const status = useGetStatus(sectionKey);

  // TODO rework refs
  const sectionRef = useRef(null);
  if (sectionRefs) sectionRefs[sectionKey] = sectionRef;

  // TODO: behaviour when changing existing section
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(status === "loaded");
  }, [status]);

  // TODO: from old implementation, close section when hiding mobile popout
  useEffect(() => {
    if (!showLessonMobile) {
      setIsOpen(false);
    }
  }, [showLessonMobile, setIsOpen]);

  // TODO: old implementation, move to central manager
  useScrollToSection({
    status,
    userHasCancelledAutoScroll,
    section,
    documentContainerRef,
    sectionRef,
  });

  if (status === "empty") {
    return null;
  }

  return (
    <DropDownSectionWrapper
      $borderColor="black"
      $bb="border-solid-m"
      $pv="inner-padding-xl"
      // ref={sectionRef}
    >
      <OakFlex $gap="all-spacing-2">
        <OakBox>
          {status === "streaming" && <LoadingWheel />}
          {status === "loaded" && <Icon icon="tick" size="sm" />}
        </OakBox>

        <FullWidthButton onClick={() => setIsOpen(!isOpen)} aria-label="toggle">
          <OakFlex $width="100%" $justifyContent="space-between">
            <OakP $font="heading-6">{sectionTitle(sectionKey)}</OakP>
            <Icon icon={isOpen ? "chevron-up" : "chevron-down"} size="sm" />
          </OakFlex>
        </FullWidthButton>
      </OakFlex>

      {isOpen && (
        <div className="mt-12 w-full">
          {status === "loaded" && section ? (
            <LessonPlanSectionContent sectionKey={sectionKey} value={section} />
          ) : (
            <Skeleton loaded={false} numberOfRows={1}>
              <p>Loading</p>
            </Skeleton>
          )}
        </div>
      )}
    </DropDownSectionWrapper>
  );
};

const FullWidthButton = styled.button`
  width: 100%;
`;

const DropDownSectionWrapper = styled(OakBox)`
  &:first-child {
    border-top: 2px solid black;
  }
`;
