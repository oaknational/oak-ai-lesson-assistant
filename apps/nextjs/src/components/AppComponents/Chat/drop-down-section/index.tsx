import { useEffect, useRef, useState } from "react";

import type {
  LessonPlanKeys,
  LessonPlanSectionWhileStreaming,
} from "@oakai/aila/src/protocol/schema";
import { camelCaseToSentenceCase } from "@oakai/core/src/utils/camelCaseConversion";
import {
  OakBox,
  OakFlex,
  OakP,
  OakSmallPrimaryButton,
} from "@oaknational/oak-components";
import { equals } from "ramda";
import styled from "styled-components";

import { Icon } from "@/components/Icon";
import LoadingWheel from "@/components/LoadingWheel";
import { scrollToRef } from "@/utils/scrollToRef";

import Skeleton from "../../common/Skeleton";
import ChatSection from "./chat-section";

const HALF_SECOND = 500;

export type DropDownSectionProps<T extends LessonPlanSectionWhileStreaming> =
  Readonly<{
    section: LessonPlanKeys;
    sectionRefs: Record<string, React.MutableRefObject<HTMLDivElement | null>>;
    value: T;
    candidates?: T[];
    documentContainerRef: React.MutableRefObject<HTMLDivElement | null>;
    userHasCancelledAutoScroll: boolean;
    showLessonMobile: boolean;
    streamingTimeout?: number;
  }>;

function DropDownSection<T extends LessonPlanSectionWhileStreaming>({
  section,
  sectionRefs,
  value,
  candidates,
  documentContainerRef,
  userHasCancelledAutoScroll,
  showLessonMobile,
  streamingTimeout = HALF_SECOND,
}: DropDownSectionProps<T>) {
  const sectionRef = useRef(null);
  if (sectionRefs) sectionRefs[section] = sectionRef;
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"empty" | "isStreaming" | "isLoaded">(
    "empty",
  );
  const [prevValue, setPrevValue] = useState<T | {}>({});
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
            <>
              {candidates?.length ? (
                <MultiCandidateSection
                  candidates={[
                    {
                      label: "Candidate 1",
                      sectionKey: section,
                      sectionValue: value,
                    },
                    ...(candidates?.map((candidate, i) => ({
                      label: `Candidate ${i + 2}`,
                      sectionKey: section,
                      sectionValue: candidate,
                    })) ?? []),
                  ]}
                />
              ) : (
                <ChatSection section={section} value={value} />
              )}
            </>
          ) : (
            <Skeleton loaded={false} numberOfRows={1}>
              <p>Loading</p>
            </Skeleton>
          )}
        </div>
      )}
    </DropDownSectionWrapper>
  );
}

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

function MultiCandidateSection({
  candidates,
}: Readonly<{
  candidates: {
    sectionKey: LessonPlanKeys;
    label: string;
    sectionValue: LessonPlanSectionWhileStreaming;
  }[];
}>) {
  const [chosenCandidate, setChosenCandidate] = useState(candidates[0]);

  return (
    <>
      <OakFlex>
        {candidates.map((candidate) => (
          <OakSmallPrimaryButton
            key={candidate.label}
            onClick={() => setChosenCandidate(candidate)}
            $mr={"space-between-s"}
          >
            {candidate.label}
          </OakSmallPrimaryButton>
        ))}
      </OakFlex>
      <div>
        {chosenCandidate && (
          <ChatSection
            section={chosenCandidate.sectionKey}
            value={chosenCandidate.sectionValue}
          />
        )}
      </div>
    </>
  );
}
