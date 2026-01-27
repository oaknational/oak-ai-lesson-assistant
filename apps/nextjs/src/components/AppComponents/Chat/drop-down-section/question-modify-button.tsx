import type { LatestQuizQuestion } from "@oakai/aila/src/protocol/schema";

import type { AilaUserModificationAction } from "@prisma/client";

import { ComponentType } from "@/lib/avo/Avo";

import ActionButtonWrapper from "./action-button-wrapper";
import { questionModifyOptions } from "./action-button.types";
import type { FeedbackOption } from "./drop-down-form-wrapper";

export type QuestionModifyButtonProps = Readonly<{
  quizType: "starterQuiz" | "exitQuiz";
  questionIndex: number;
  questionValue: LatestQuizQuestion;
}>;

const quizTypeLabel = (quizType: "starterQuiz" | "exitQuiz") =>
  quizType === "starterQuiz" ? "starter quiz" : "exit quiz";

const QuestionModifyButton = ({
  quizType,
  questionIndex,
  questionValue,
}: QuestionModifyButtonProps) => {
  const questionNumber = questionIndex + 1;
  const sectionPath = `${quizType}.questions.${questionIndex}`;

  const generateMessage = (
    option: FeedbackOption<AilaUserModificationAction>,
    userFeedbackText: string,
  ) => {
    const questionRef = `question ${questionNumber} of the ${quizTypeLabel(quizType)}`;
    if (option.label === "Other") {
      return `For ${questionRef}, ${userFeedbackText}`;
    }
    if (option.enumValue === "REMOVE") {
      return `Remove ${questionRef}`;
    }
    if (option.enumValue === "REPLACE") {
      const detail = userFeedbackText ? `: ${userFeedbackText}` : "";
      return `Replace ${questionRef} with a different question${detail}`;
    }
    if (option.enumValue === "MOVE_POSITION") {
      const detail = userFeedbackText
        ? ` to ${userFeedbackText}`
        : " to a different position";
      return `Move ${questionRef}${detail}`;
    }
    return `Make ${questionRef} ${option.chatMessage?.toLowerCase()}`;
  };

  return (
    <ActionButtonWrapper
      sectionTitle={`Modify question ${questionNumber}:`}
      sectionPath={sectionPath}
      sectionValue={questionValue}
      options={questionModifyOptions}
      actionButtonLabel="Modify"
      tooltip="Aila can help improve this question"
      userSuggestionTitle="How do you want to modify this question?"
      buttonText="Modify question"
      generateMessage={generateMessage}
      trackingComponentType={ComponentType.MODIFY_BUTTON}
    />
  );
};

export default QuestionModifyButton;
