import type { LessonPlanSectionWhileStreaming } from "@oakai/aila/src/protocol/schema";

import type { AilaUserModificationAction } from "@prisma/client";

import { ComponentType } from "@/lib/avo/Avo";

import ActionButtonWrapper from "./action-button-wrapper";
import { quizModifyOptions } from "./action-button.types";
import type { FeedbackOption } from "./drop-down-form-wrapper";

export type QuizModifyButtonProps = Readonly<{
  sectionTitle: string;
  sectionPath: string;
  sectionValue: LessonPlanSectionWhileStreaming;
}>;

const QuizModifyButton = ({
  sectionTitle,
  sectionPath,
  sectionValue,
}: QuizModifyButtonProps) => {
  const section = sectionTitle.toLowerCase();
  const generateMessage = (
    option: FeedbackOption<AilaUserModificationAction>,
    userFeedbackText: string,
  ) => {
    switch (option.label) {
      case "Generate a new quiz": {
        const detail = userFeedbackText ? `: ${userFeedbackText}` : "";
        return `Generate a new ${section}${detail}`;
      }
      case "Change question":
        return `For the ${section}, change question: ${userFeedbackText}`;
      case "Add question":
        return `For the ${section}, add a question: ${userFeedbackText}`;
      case "Remove question":
        return `For the ${section}, remove question: ${userFeedbackText}`;
      default:
        return `For the ${section}, ${userFeedbackText}`;
    }
  };

  return (
    <ActionButtonWrapper
      sectionTitle={`Ask Aila to modify ${section}:`}
      sectionPath={sectionPath}
      sectionValue={sectionValue}
      options={quizModifyOptions}
      actionButtonLabel="Modify"
      tooltip="Aila can help improve this quiz"
      userSuggestionTitle="How do you want to modify this quiz?"
      buttonText="Modify quiz"
      generateMessage={generateMessage}
      trackingComponentType={ComponentType.MODIFY_BUTTON}
    />
  );
};

export default QuizModifyButton;
