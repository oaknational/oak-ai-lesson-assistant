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
      $pa="spacing-16"
      $background="bg-decorative5-very-subdued"
      $borderColor="border-decorative5-stronger"
      $borderStyle="solid"
      $borderRadius="border-radius-m"
      $ba="border-solid-m"
    >
      <OakFlex
        $gap="spacing-20"
        $alignItems={["flex-start", "center"]}
        $flexDirection={["column", "row"]}
      >
        <AiIcon />
        <OakP $font="body-2">
          Complete the {inCompleteSections.length} remaining sections to unlock
          your resources.
        </OakP>
      </OakFlex>
      <OakBox $pl={["spacing-0", "spacing-56"]} $mt="spacing-16">
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
            <OakUL $mv="spacing-24" $ml="spacing-16">
              {inCompleteSections.map((section) => (
                <OakLI
                  key={section.key}
                  $font="body-2"
                  $listStyle="disc"
                  $pv="spacing-8"
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
