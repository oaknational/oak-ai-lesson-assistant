import type { Components } from "react-markdown";

import type { LatestQuizQuestion } from "@oakai/aila/src/protocol/schema";

import { OakBox, OakFlex } from "@oaknational/oak-components";

import QuestionModifyButton from "@/components/AppComponents/Chat/drop-down-section/question-modify-button";
import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";

type QuestionWrapperProps = {
  questionNumber: number;
  questionType: string;
  quizType?: "starterQuiz" | "exitQuiz";
  questionIndex?: number;
  question: LatestQuizQuestion;
  questionText: string;
  markdownComponents?: Components;
  children: React.ReactNode;
};

export const QuestionWrapper = ({
  questionNumber,
  questionType,
  quizType,
  questionIndex,
  question,
  questionText,
  markdownComponents,
  children,
}: QuestionWrapperProps) => {
  return (
    <OakBox
      $mb="spacing-48"
      role="group"
      aria-label={`Question ${questionNumber}: ${questionType}`}
    >
      <OakFlex $mb="spacing-16">
        <OakBox className="leading-[26px]">{questionNumber}.&nbsp;</OakBox>
        <MemoizedReactMarkdownWithStyles
          markdown={questionText}
          className="[&>p]:mb-0"
          components={markdownComponents}
        />
      </OakFlex>
      {children}
      {quizType && questionIndex !== undefined && (
        <OakFlex $mt="spacing-8" $display={["none", "flex"]}>
          <QuestionModifyButton
            quizType={quizType}
            questionIndex={questionIndex}
            questionValue={question}
          />
        </OakFlex>
      )}
    </OakBox>
  );
};
