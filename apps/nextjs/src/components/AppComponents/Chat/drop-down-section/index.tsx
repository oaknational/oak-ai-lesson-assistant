import { useEffect, useRef, useState } from "react";

import { sectionToMarkdown } from "@oakai/aila/src/protocol/sectionToMarkdown";
import { OakBox, OakFlex, OakP } from "@oaknational/oak-components";
import { lessonSectionTitlesAndMiniDescriptions } from "data/lessonSectionTitlesAndMiniDescriptions";
import styled from "styled-components";

import { Icon } from "@/components/Icon";
import LoadingWheel from "@/components/LoadingWheel";
import { scrollToRef } from "@/utils/scrollToRef";

import Skeleton from "../../common/Skeleton";
import { MemoizedReactMarkdownWithStyles } from "../markdown";
import ChatSection from "./chat-section";
import FlagButton from "./flag-button";
import ModifyButton from "./modify-button";

const DropDownSection = ({
  objectKey,
  sectionRefs,
  value,
  documentContainerRef,
  userHasCancelledAutoScroll,
}: {
  objectKey: string;
  sectionRefs: Record<string, React.MutableRefObject<HTMLDivElement | null>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  documentContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  userHasCancelledAutoScroll: boolean;
}) => {
  const sectionRef = useRef(null);
  if (sectionRefs) sectionRefs[objectKey] = sectionRef;
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"empty" | "isStreaming" | "isLoaded">(
    "empty",
  );
  const [prevValue, setPrevValue] = useState<Record<string, unknown>>({});
  const [sectionHasFired, setSectionHasFired] = useState(false);

  useEffect(() => {
    if (value === null || value === undefined || !value) {
      setStatus("empty");
    } else if (!valuesAreEqual(value, prevValue)) {
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
      const timer = setTimeout(() => {
        setStatus("isLoaded");

        setPrevValue(value);
      }, 500); // 0.5 seconds delay

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
    objectKey,
    setIsOpen,
    prevValue,
    documentContainerRef,
    userHasCancelledAutoScroll,
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

        <FullWidthButton onClick={() => setIsOpen(!isOpen)}>
          <OakFlex $width="100%" $justifyContent="space-between">
            <OakP $font="heading-6">{humanizeCamelCaseString(objectKey)}</OakP>
            <Icon icon={isOpen ? "chevron-up" : "chevron-down"} size="sm" />
          </OakFlex>
        </FullWidthButton>
      </OakFlex>

      {isOpen && (
        <div className="mt-12 w-full">
          {status === "isLoaded" ? (
            <ChatSection objectKey={objectKey} value={value} />
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

const valuesAreEqual = (
  val1: Record<string, unknown>,
  val2: Record<string, unknown>,
): boolean => {
  if (typeof val1 !== typeof val2) return false;
  if (typeof val1 === "object" && val1 !== null && val2 !== null) {
    if (Array.isArray(val1) && Array.isArray(val2)) {
      return JSON.stringify(val1) === JSON.stringify(val2);
    } else {
      return JSON.stringify(val1) === JSON.stringify(val2);
    }
  }
  return val1 === val2;
};

export function humanizeCamelCaseString(str: string) {
  if (str.startsWith("cycle")) {
    return "Cycle " + str.split("cycle")[1];
  }
  return str.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase();
  });
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
