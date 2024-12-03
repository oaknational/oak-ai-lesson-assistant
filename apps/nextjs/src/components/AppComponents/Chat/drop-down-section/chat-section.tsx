import { sectionToMarkdown } from "@oakai/aila/src/protocol/sectionToMarkdown";
import { OakFlex } from "@oaknational/oak-components";
import { MathJax } from "better-react-mathjax";
import { lessonSectionTitlesAndMiniDescriptions } from "data/lessonSectionTitlesAndMiniDescriptions";

import { sectionTitle } from ".";
import { MemoizedReactMarkdownWithStyles } from "../markdown";
import AddAdditionalMaterialsButton from "./add-additional-materials-button";
import FlagButton from "./flag-button";
import ModifyButton from "./modify-button";

export type ChatSectionProps = Readonly<{
  objectKey: string;
  value: Record<string, unknown> | string | Array<unknown>;
}>;
const ChatSection = ({ objectKey, value }: ChatSectionProps) => {
  return (
    <OakFlex $flexDirection="column">
      <MathJax>
        <MemoizedReactMarkdownWithStyles
          lessonPlanSectionDescription={
            lessonSectionTitlesAndMiniDescriptions[objectKey]?.description
          }
          markdown={`${sectionToMarkdown(objectKey, value)}`}
        />
      </MathJax>
      <OakFlex
        $gap="all-spacing-3"
        $mt="space-between-s"
        $position="relative"
        $display={["none", "flex"]}
      >
        {objectKey === "additionalMaterials" && value === "None" ? (
          <AddAdditionalMaterialsButton
            sectionTitle={sectionTitle(objectKey)}
            sectionPath={objectKey}
            sectionValue={value}
          />
        ) : (
          <ModifyButton
            sectionTitle={sectionTitle(objectKey)}
            sectionPath={objectKey}
            sectionValue={value}
          />
        )}

        <FlagButton
          sectionTitle={sectionTitle(objectKey)}
          sectionPath={objectKey}
          sectionValue={value}
        />
      </OakFlex>
    </OakFlex>
  );
};

export default ChatSection;
