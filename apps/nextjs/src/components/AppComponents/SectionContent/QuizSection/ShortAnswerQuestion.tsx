import type { QuizV2QuestionShortAnswer } from "@oakai/aila/src/protocol/schema";

import { OakBox, OakFlex } from "@oaknational/oak-components";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";

type ShortAnswerQuestionProps = {
  question: QuizV2QuestionShortAnswer;
  questionNumber: number;
};

export const ShortAnswerQuestion = ({
  question,
  questionNumber,
}: ShortAnswerQuestionProps) => {
  // Check if answer should be inline (within the text) or on a separate line
  const hasInlineAnswer = question.question.includes("[answer]");

  return (
    <OakBox $mb="space-between-l">
      <OakFlex $mb="space-between-s">
        <OakBox className="leading-[26px]">{questionNumber}.&nbsp;</OakBox>
        {hasInlineAnswer ? (
          <MemoizedReactMarkdownWithStyles
            markdown={question.question.replace("[answer]", "**[answer]**")}
            className="[&>p]:mb-0"
          />
        ) : (
          <MemoizedReactMarkdownWithStyles
            markdown={question.question}
            className="[&>p]:mb-0"
          />
        )}
      </OakFlex>

      {!hasInlineAnswer && (
        <OakBox $mb="space-between-m">
          <OakBox $font="body-2-bold">[Answer]</OakBox>
        </OakBox>
      )}
    </OakBox>
  );
};
