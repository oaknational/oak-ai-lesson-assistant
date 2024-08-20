import { sectionToMarkdown } from "@oakai/aila/src/protocol/sectionToMarkdown";
import { humanizeCamelCaseString } from "@oakai/core/src/utils/humanizeCamelCaseString";
import { OakFlex } from "@oaknational/oak-components";
import { lessonSectionTitlesAndMiniDescriptions } from "data/lessonSectionTitlesAndMiniDescriptions";

import { MemoizedReactMarkdownWithStyles } from "../markdown";
import FlagButton from "./flag-button";
import ModifyButton from "./modify-button";

const ChatSection = ({
  objectKey,
  value,
}: {
  objectKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}) => {
  return (
    <OakFlex $flexDirection="column">
      <MemoizedReactMarkdownWithStyles
        lessonPlanSectionDescription={
          lessonSectionTitlesAndMiniDescriptions[objectKey]?.description
        }
        markdown={`${sectionToMarkdown(objectKey, value)}`}
      />
      <OakFlex $gap="all-spacing-3" $mt="space-between-s" $position="relative">
        <ModifyButton section={humanizeCamelCaseString(objectKey)} />
        <FlagButton />
      </OakFlex>
    </OakFlex>
  );
};

export default ChatSection;
