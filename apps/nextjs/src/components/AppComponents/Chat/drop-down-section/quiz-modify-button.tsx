import type { LessonPlanSectionWhileStreaming } from "@oakai/aila/src/protocol/schema";

import type { AilaUserModificationAction } from "@prisma/client";

import { ComponentType } from "@/lib/avo/Avo";

import ActionButtonWrapper from "./action-button-wrapper";
import { quizModifyOptions } from "./action-button.types";
import { buildQuizMessage } from "./buildQuizMessage";
import type { FeedbackOption } from "./drop-down-form-wrapper";

export type QuizModifyButtonProps = Readonly<{
  sectionTitle: string;
  sectionPath: "starterQuiz" | "exitQuiz";
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
  ) =>
    buildQuizMessage({
      sectionLabel: section,
      details: userFeedbackText,
      optionLabel: option.label,
    });

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
