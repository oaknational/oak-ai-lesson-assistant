import { useState } from "react";

import {
  OakBox,
  OakFlex,
  OakLI,
  OakLink,
  OakP,
  OakSpan,
  OakUL,
} from "@oaknational/oak-components";

import AiIcon from "@/components/SVGParts/AiIcon";

import type { ProgressSections } from "../Chat/Chat/hooks/useProgressForDownloads";

export type SectionsNotCompleteDownloadNoticeProps = Readonly<{
  sections: ProgressSections;
}>;

const SectionsNotCompleteDownloadNotice = ({
  sections,
}: SectionsNotCompleteDownloadNoticeProps) => {
  const [showMissingSections, setShowMissingSections] = useState(false);
  const inCompleteSections = sections.filter((section) => !section.complete);
  return (
    <OakBox
      $pa="inner-padding-m"
      $background="lemon30"
      $borderColor="border-decorative5-stronger"
      $borderStyle="solid"
      $borderRadius="border-radius-m"
      $ba="border-solid-m"
    >
      <OakFlex
        $gap="all-spacing-5"
        $alignItems={["flex-start", "center"]}
        $flexDirection={["column", "row"]}
      >
        <AiIcon />
        <OakP $font="body-2">
          Complete the {inCompleteSections.length} remaining sections to unlock
          your resources.
        </OakP>
      </OakFlex>
      <OakBox
        $pl={["inner-padding-none", "inner-padding-xl5"]}
        $mt="space-between-s"
      >
        <OakLink
          element="button"
          iconName={showMissingSections ? "chevron-up" : "chevron-down"}
          isTrailingIcon={true}
          onClick={() => setShowMissingSections(!showMissingSections)}
        >
          <OakSpan $font="body-2">
            {showMissingSections ? "Hide" : "Show"} missing sections
          </OakSpan>
        </OakLink>
        {showMissingSections && (
          <>
            <OakUL $mv="space-between-m" $ml="space-between-s">
              {inCompleteSections.map((section) => (
                <OakLI
                  key={section.key}
                  $font="body-2"
                  $listStyle="disc"
                  $pv="inner-padding-xs"
                >
                  <OakP $font="body-2">{section.label}</OakP>
                </OakLI>
              ))}
            </OakUL>

            <OakP $font="body-2">
              If Aila doesn’t suggest adding these, you can ask directly, for
              example,{" "}
              <OakSpan $font="body-2-bold">
                “Please add prior knowledge and key learning points to my
                lesson”.
              </OakSpan>
            </OakP>
          </>
        )}
      </OakBox>
    </OakBox>
  );
};

export default SectionsNotCompleteDownloadNotice;
