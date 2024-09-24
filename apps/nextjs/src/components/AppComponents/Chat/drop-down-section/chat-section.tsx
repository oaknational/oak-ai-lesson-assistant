import { sectionToMarkdown } from "@oakai/aila/src/protocol/sectionToMarkdown";
import { OakFlex } from "@oaknational/oak-components";
import { lessonSectionTitlesAndMiniDescriptions } from "data/lessonSectionTitlesAndMiniDescriptions";

import { sectionTitle } from ".";
import { MemoizedReactMarkdownWithStyles } from "../markdown";
import FlagButton from "./flag-button";
import ModifyButton from "./modify-button";

const ChatSection = ({
  objectKey,
  value,
}: {
  objectKey: string;
  value: Record<string, unknown> | string | Array<unknown>;
}) => {
  return (
    <OakFlex $flexDirection="column">
      <MemoizedReactMarkdownWithStyles
        lessonPlanSectionDescription={
          lessonSectionTitlesAndMiniDescriptions[objectKey]?.description
        }
        markdown={`${sectionToMarkdown(objectKey, value)}`}
      />
      <OakFlex
        $gap="all-spacing-3"
        $mt="space-between-s"
        $position="relative"
        $display={["none", "flex"]}
      >
        <ModifyButton
          sectionTitle={sectionTitle(objectKey)}
          sectionPath={objectKey}
          sectionValue={value}
        />
        <FlagButton
          sectionTitle={sectionTitle(objectKey)}
          sectionPath={objectKey}
          sectionValue={value}
        />
<<<<<<< HEAD
        <FlagButton section={sectionTitle(objectKey)} />
=======
>>>>>>> main
      </OakFlex>
    </OakFlex>
  );
};

export default ChatSection;
