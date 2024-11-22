import {
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

const ChatSection = ({
  objectKey,
  value,
}: {
  objectKey: LessonPlanKeys;
  value: LessonPlanSectionWhileStreaming;
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
