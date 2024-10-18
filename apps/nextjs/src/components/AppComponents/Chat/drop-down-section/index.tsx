import { useEffect, useRef, useState } from "react";

import { LessonPlanSectionWhileStreaming } from "@oakai/aila/src/protocol/schema";
import { camelCaseToSentenceCase } from "@oakai/core/src/utils/camelCaseToSentenceCase";
import { OakBox, OakFlex, OakP } from "@oaknational/oak-components";
import styled from "styled-components";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { Icon } from "@/components/Icon";
import LoadingWheel from "@/components/LoadingWheel";
import { scrollToRef } from "@/utils/scrollToRef";

import Skeleton from "../../common/Skeleton";
import ChatSection from "./chat-section";

const DropDownSection = ({
  objectKey,
  sectionRefs,
  value,
  documentContainerRef,
  userHasCancelledAutoScroll,
  showLessonMobile,
}: {
  objectKey: string;
  sectionRefs: Record<string, React.MutableRefObject<HTMLDivElement | null>>;
  value: LessonPlanSectionWhileStreaming;
  documentContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  userHasCancelledAutoScroll: boolean;
  showLessonMobile: boolean;
}) => {
  const { ailaStreamingStatus, streamingSection, streamingSections } =
    useLessonChat();
  const sectionRef = useRef(null);
  if (sectionRefs) sectionRefs[objectKey] = sectionRef;
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"empty" | "isStreaming" | "isLoaded">(
    "empty",
  );
  const [sectionHasFired, setSectionHasFired] = useState(false);

  useEffect(() => {
    if (!showLessonMobile) {
      setIsOpen(false);
    }
  }, [showLessonMobile]);

  useEffect(() => {
    if (
      ailaStreamingStatus === "StreamingLessonPlan" &&
      streamingSection === objectKey
    ) {
      setStatus("isStreaming");

      if (sectionRef && sectionHasFired === false && status === "isStreaming") {
        if (objectKey && value) {
          function scrollToSection() {
            if (!userHasCancelledAutoScroll) {
              scrollToRef({
                ref: sectionRef,
                containerRef: documentContainerRef,
                duration: 1000,
              });
            }
            setSectionHasFired(true);
          }
          scrollToSection();
        }
      }
      setIsOpen(true);
    } else if (value) {
      setStatus("isLoaded");
    }
  }, [
    ailaStreamingStatus,
    value,
    setStatus,
    sectionRef,
    sectionHasFired,
    status,
    objectKey,
    setIsOpen,
    documentContainerRef,
    userHasCancelledAutoScroll,
    streamingSection,
    streamingSections,
  ]);

  return (
    <DropDownSectionWrapper
      $borderColor="black"
      $bb="border-solid-m"
      $pv="inner-padding-xl"
      ref={sectionRef}
    >
      <OakFlex $gap="all-spacing-2">
        <OakBox>
          {status === "empty" && <div className="w-14"></div>}
          <LoadingWheel visible={status === "isStreaming"} />
          <Icon
            icon="tick"
            size="sm"
            className={status === "isStreaming" ? "hidden" : "block"}
          />
        </OakBox>

        <FullWidthButton onClick={() => setIsOpen(!isOpen)}>
          <OakFlex $width="100%" $justifyContent="space-between">
            <OakP $font="heading-6">{sectionTitle(objectKey)}</OakP>
            <Icon icon={isOpen ? "chevron-up" : "chevron-down"} size="sm" />
          </OakFlex>
        </FullWidthButton>
      </OakFlex>

      {isOpen && (
        <div className="mt-12 w-full">
          {status === "isLoaded" ? (
            <ChatSection key={objectKey} objectKey={objectKey} value={value} />
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

export function sectionTitle(str: string) {
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
