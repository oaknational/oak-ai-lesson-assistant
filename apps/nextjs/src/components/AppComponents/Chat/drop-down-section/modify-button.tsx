import type { LessonPlanSectionWhileStreaming } from "@oakai/aila/src/protocol/schema";

import type { AilaUserModificationAction } from "@prisma/client";

import { ComponentType } from "@/lib/avo/Avo";

import ActionButtonWrapper from "./action-button-wrapper";
import type { ModifyOptions, QuizModifyOptions } from "./action-button.types";
import { modifyOptions } from "./action-button.types";
import type { FeedbackOption } from "./drop-down-form-wrapper";

export type ModifyButtonProps = Readonly<{
  sectionTitle: string;
  sectionPath: string;
  sectionValue: LessonPlanSectionWhileStreaming;
  options?: ModifyOptions | QuizModifyOptions;
}>;

const ModifyButton = ({
  sectionTitle,
  sectionPath,
  sectionValue,
  options = modifyOptions,
}: ModifyButtonProps) => {
  const section = sectionTitle.toLowerCase();
  const generateMessage = (
    option: FeedbackOption<AilaUserModificationAction>,
    userFeedbackText: string,
  ) => {
    if (option.label === "Other") {
      return `For the ${section}, ${userFeedbackText}`;
    }
    if (option.enumValue === "REGENERATE") {
      const detail = userFeedbackText ? `: ${userFeedbackText}` : "";
      return `Generate a new ${section}${detail}`;
    }
    if (option.enumValue === "CHANGE_QUESTION") {
      return `For the ${section}, change question: ${userFeedbackText}`;
    }
    if (option.enumValue === "ADD_QUESTION") {
      return `For the ${section}, add a question: ${userFeedbackText}`;
    }
    if (option.enumValue === "REMOVE_QUESTION") {
      return `For the ${section}, remove question: ${userFeedbackText}`;
    }
    return `Make the ${section} ${option.chatMessage?.toLowerCase()}`;
  };

  return (
    <ActionButtonWrapper
      sectionTitle={`Ask Aila to modify ${sectionTitle.toLowerCase()}:`}
      sectionPath={sectionPath}
      sectionValue={sectionValue}
      options={options}
      actionButtonLabel="Modify"
      tooltip="Aila can help improve this section"
      userSuggestionTitle="How do you want to modify?"
      buttonText="Modify section"
      generateMessage={generateMessage}
      trackingComponentType={ComponentType.MODIFY_BUTTON}
    />
  );
};

export default ModifyButton;
