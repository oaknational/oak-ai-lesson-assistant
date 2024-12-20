import type {
  LessonPlanKeys,
  LessonPlanSectionWhileStreaming,
} from "@oakai/aila/src/protocol/schema";
import { sectionToMarkdown } from "@oakai/aila/src/protocol/sectionToMarkdown";
import { OakFlex } from "@oaknational/oak-components";
import { lessonSectionTitlesAndMiniDescriptions } from "data/lessonSectionTitlesAndMiniDescriptions";

import { sectionTitle } from ".";
import { MemoizedReactMarkdownWithStyles } from "../markdown";
import AddAdditionalMaterialsButton from "./add-additional-materials-button";
import FlagButton from "./flag-button";
import ModifyButton from "./modify-button";

export type ChatSectionProps = Readonly<{
  section: LessonPlanKeys;
  value: LessonPlanSectionWhileStreaming;
}>;

const ChatSection = ({ section, value }: ChatSectionProps) => {
  return (
    <OakFlex $flexDirection="column">
      <MemoizedReactMarkdownWithStyles
        lessonPlanSectionDescription={
          lessonSectionTitlesAndMiniDescriptions[section]?.description
        }
        markdown={`${sectionToMarkdown(section, value)}`}
      />
      <OakFlex
        $gap="all-spacing-3"
        $mt="space-between-s"
        $position="relative"
        $display={["none", "flex"]}
      >
        {section === "additionalMaterials" && value === "None" ? (
          <AddAdditionalMaterialsButton
            sectionTitle={sectionTitle(section)}
            sectionPath={section}
            sectionValue={value}
          />
        ) : (
          <ModifyButton
            sectionTitle={sectionTitle(section)}
            sectionPath={section}
            sectionValue={value}
          />
        )}

        <FlagButton
          sectionTitle={sectionTitle(section)}
          sectionPath={section}
          sectionValue={value}
        />
      </OakFlex>
    </OakFlex>
  );
};

export default ChatSection;
