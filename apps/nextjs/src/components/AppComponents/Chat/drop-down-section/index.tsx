import { useEffect, useRef, useState } from "react";

import type { LessonPlanKey } from "@oakai/aila/src/protocol/schema";
import { camelCaseToSentenceCase } from "@oakai/core/src/utils/camelCaseConversion";
import { OakBox, OakFlex, OakP } from "@oaknational/oak-components";
import { equals } from "ramda";
import styled from "styled-components";

import { Icon } from "@/components/Icon";
import LoadingWheel from "@/components/LoadingWheel";
import { scrollToRef } from "@/utils/scrollToRef";

import Skeleton from "../../common/Skeleton";
import ChatSection from "./chat-section";

const HALF_SECOND = 500;

export type DropDownSectionProps = Readonly<{
  section: LessonPlanKey;
  sectionRefs: Record<string, React.MutableRefObject<HTMLDivElement | null>>;
  // @todo this is bug - LessonPlanSectionWhileStreaming and string is passed in but the type of prevValue is Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  documentContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  userHasCancelledAutoScroll: boolean;
  showLessonMobile: boolean;
  streamingTimeout?: number;
}>;

const DropDownSection = ({
  section,
  sectionRefs,
  value,
  documentContainerRef,
  userHasCancelledAutoScroll,
  showLessonMobile,
  streamingTimeout = HALF_SECOND,
}: DropDownSectionProps) => {
  const sectionRef = useRef(null);
  if (sectionRefs) sectionRefs[section] = sectionRef;
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"empty" | "isStreaming" | "isLoaded">(
    "empty",
  );
  const [prevValue, setPrevValue] = useState<Record<string, unknown>>({});
  const [sectionHasFired, setSectionHasFired] = useState(false);

  useEffect(() => {
    if (!showLessonMobile) {
      setIsOpen(false);
    }
  }, [showLessonMobile]);

  useEffect(() => {
    if (value === null || value === undefined || !value) {
      setStatus("empty");
    } else if (!equals(value, prevValue)) {
      setStatus("isStreaming");

      if (sectionRef && sectionHasFired === false && status === "isStreaming") {
        if (section && value) {
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
      const timer = setTimeout(() => {
        setStatus("isLoaded");
        // @todo this is a bug - value is not typed
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setPrevValue(value);
      }, streamingTimeout);

      return () => clearTimeout(timer);
    } else {
      setStatus("isLoaded");
    }
  }, [
    value,
    setStatus,
    sectionRef,
    sectionHasFired,
    status,
    section,
    setIsOpen,
    prevValue,
    documentContainerRef,
    userHasCancelledAutoScroll,
    streamingTimeout,
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
          {status === "isStreaming" && <LoadingWheel />}
          {status === "isLoaded" && <Icon icon="tick" size="sm" />}
        </OakBox>

        <FullWidthButton onClick={() => setIsOpen(!isOpen)} aria-label="toggle">
          <OakFlex $width="100%" $justifyContent="space-between">
            <OakP $font="heading-6">{sectionTitle(section)}</OakP>
            <Icon icon={isOpen ? "chevron-up" : "chevron-down"} size="sm" />
          </OakFlex>
        </FullWidthButton>
      </OakFlex>

      {isOpen && (
        <div className="mt-12 w-full">
          {status === "isLoaded" ? (
            <ChatSection section={section} value={value} />
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
