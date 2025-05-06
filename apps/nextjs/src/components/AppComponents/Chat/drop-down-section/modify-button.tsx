import type { LessonPlanSectionWhileStreaming } from "@oakai/aila/src/protocol/schema";

import type { AilaUserModificationAction } from "@prisma/client";

import { ComponentType } from "@/lib/avo/Avo";

import ActionButtonWrapper from "./action-button-wrapper";
import { modifyOptions } from "./action-button.types";
import type { FeedbackOption } from "./drop-down-form-wrapper";

export type ModifyButtonProps = Readonly<{
  sectionTitle: string;
  sectionPath: string;
  sectionValue: LessonPlanSectionWhileStreaming;
}>;

const ModifyButton = ({
  sectionTitle,
  sectionPath,
  sectionValue,
}: ModifyButtonProps) => {
  const generateMessage = (
    option: FeedbackOption<AilaUserModificationAction>,
    userFeedbackText: string,
  ) =>
    option.label === "Other"
      ? `For the ${sectionTitle.toLowerCase()}, ${userFeedbackText}`
      : `Make the ${sectionTitle.toLowerCase()} ${option.chatMessage?.toLowerCase()}`;

  return (
    <ActionButtonWrapper
      sectionTitle={`Ask Aila to modify ${sectionTitle.toLowerCase()}:`}
      sectionPath={sectionPath}
      sectionValue={sectionValue}
      options={modifyOptions}
      actionButtonLabel="Modify"
      tooltip="Aila can help improve this section"
      userSuggestionTitle="Provide modification options:"
      buttonText="Modify section"
      generateMessage={generateMessage}
      trackingComponentType={ComponentType.MODIFY_BUTTON}
    />
  );
};

export default ModifyButton;
