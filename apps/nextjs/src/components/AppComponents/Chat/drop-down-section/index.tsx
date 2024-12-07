import { useEffect, useMemo, useRef } from "react";

import type {
  LessonPlanKeys,
  LessonPlanSectionWhileStreaming,
} from "@oakai/aila/src/protocol/schema";
import { camelCaseToSentenceCase } from "@oakai/core/src/utils/camelCaseConversion";
import { OakBox, OakFlex, OakP } from "@oaknational/oak-components";
import styled from "styled-components";

import { Icon } from "@/components/Icon";
import LoadingWheel from "@/components/LoadingWheel";

import Skeleton from "../../common/Skeleton";
import type { AilaStreamingStatus } from "../Chat/hooks/useAilaStreamingStatus";
import ChatSection from "./chat-section";

const DropDownSection = ({
  section,
  value,
  isOpen,
  setIsOpen,
  ailaStreamingStatus,
  streamingSection,
  visible,
  setSectionRef,
}: {
  section: LessonPlanKeys;
  value: LessonPlanSectionWhileStreaming | undefined;
  isOpen: boolean;
  setIsOpen: (section: string, isOpen: boolean) => void;
  ailaStreamingStatus: AilaStreamingStatus;
  streamingSection: LessonPlanKeys | undefined;
  visible: boolean;
  setSectionRef: (section: LessonPlanKeys, el: HTMLDivElement | null) => void;
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setSectionRef(section, sectionRef.current);
  }, [section, setSectionRef]);

  const sectionTitleMemo = useMemo(() => sectionTitle(section), [section]);

  const isStreaming =
    ailaStreamingStatus !== "Idle" && streamingSection === section;

  const isLoaded = !isStreaming && value !== undefined;

  return (
    <DropDownSectionWrapper
      className={visible ? "block" : "hidden"}
      $borderColor="black"
      $bb="border-solid-m"
      $pv="inner-padding-xl"
      ref={sectionRef}
      data-testid={`chat-section-${section}`}
      data-test="lesson-plan-section"
      data-test-section-key={section}
      data-test-section-complete={isLoaded ? "true" : "false"}
    >
      <FullWidthButton
        onClick={() => setIsOpen(section, !isOpen)}
        aria-label="toggle"
      >
        <OakFlex $gap="all-spacing-2">
          <OakBox>
            {!isStreaming && !isLoaded && <div className="w-14"></div>}
            <LoadingWheel visible={isStreaming} />
            <Icon
              icon="tick"
              size="sm"
              className={isStreaming ? "hidden" : "block"}
            />
          </OakBox>

          <OakFlex $width="100%" $justifyContent="space-between">
            <OakP $font="heading-6">{sectionTitleMemo}</OakP>
            <Icon icon={isOpen ? "chevron-up" : "chevron-down"} size="sm" />
          </OakFlex>
        </OakFlex>
      </FullWidthButton>
      {isOpen && (
        <div className="mt-12 w-full">
          {isLoaded ? (
            <ChatSection key={section} objectKey={section} value={value} />
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

export function sectionTitle(str: LessonPlanKeys) {
  if (str.startsWith("cycle")) {
    return "Learning cycle " + str.split("cycle")[1];
  }

  return camelCaseToSentenceCase(str);
}

const FullWidthButton = styled.button`
  width: 100%;
`;

const DropDownSectionWrapper = styled(OakBox)`
  &:first-child {
    border-top: 2px solid black;
  }
`;

export default DropDownSection;
