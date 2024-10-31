import type {
  LessonPlanKeys,
  LessonPlanSectionWhileStreaming,
} from "@oakai/aila/src/protocol/schema";
import { sectionToMarkdown } from "@oakai/aila/src/protocol/sectionToMarkdown";
import { OakBox, OakFlex } from "@oaknational/oak-components";
import { lessonSectionTitlesAndMiniDescriptions } from "data/lessonSectionTitlesAndMiniDescriptions";

import { useChatStreaming } from "@/components/ContextProviders/ChatProvider";

import { sectionTitle } from ".";
import { MemoizedReactMarkdownWithStyles } from "../markdown";
import ActionButton from "./action-button";
import FlagButton from "./flag-button";
import ModifyButton from "./modify-button";

const ChatSection = ({
  objectKey,
  value,
}: {
  objectKey: LessonPlanKeys;
  value: LessonPlanSectionWhileStreaming;
}) => {
  const { ailaStreamingStatus } = useChatStreaming();
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
        {ailaStreamingStatus === "Idle" ? (
          <>
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
          </>
        ) : (
          <>
            <DisabledButton label="Modify" />
            <DisabledButton label="Flag" />
          </>
        )}
      </OakFlex>
    </OakFlex>
  );
};

const DisabledButton = ({ label }: { label: string }) => {
  return (
    <OakBox $position="relative">
      <ActionButton disabled={true}>{label}</ActionButton>
    </OakBox>
  );
};
export default ChatSection;
