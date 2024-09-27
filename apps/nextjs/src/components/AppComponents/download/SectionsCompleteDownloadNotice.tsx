import { OakBox, OakFlex, OakP } from "@oaknational/oak-components";

import AiIcon from "@/components/SVGParts/AiIcon";

const SectionsCompleteDownloadNotice = () => {
  return (
    <OakBox
      $pa="inner-padding-m"
      $background="mint50"
      $borderColor="border-decorative1-stronger"
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
        <OakP>
          Choose the resources you would like to generate and download.
        </OakP>
      </OakFlex>
    </OakBox>
  );
};

export default SectionsCompleteDownloadNotice;
