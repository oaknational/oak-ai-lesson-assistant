import type { QuizV2QuestionShortAnswer } from "@oakai/aila/src/protocol/schema";

import { OakBox, OakFlex, OakSpan } from "@oaknational/oak-components";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";

import { addInstruction } from "./helpers";

type ShortAnswerQuestionProps = {
  question: QuizV2QuestionShortAnswer;
  questionNumber: number;
};

export const ShortAnswerQuestion = ({
  question,
  questionNumber,
}: ShortAnswerQuestionProps) => {
  // Check if answer should be inline (within the text) or on a separate line
  const hasInlineAnswer = question.question.includes("{{}}");

  // Get the first answer to display
  const displayAnswer = question.answers?.[0] || "";

  // Add instruction to question
  const questionWithInstruction = addInstruction(
    question.question,
    "Fill in the blank.",
  );

  return (
    <OakBox $mb="space-between-l">
      <OakFlex $mb="space-between-s">
        <OakBox className="leading-[26px]">{questionNumber}.&nbsp;</OakBox>
        {hasInlineAnswer ? (
          <OakBox className="[&_strong]:border-b-2 [&_strong]:border-gray-800 [&_strong]:font-bold [&_strong]:text-[#2B8848]">
            <MemoizedReactMarkdownWithStyles
              markdown={questionWithInstruction.replace(
                "{{}}",
                `**${displayAnswer}**`,
              )}
              className="[&>p]:mb-0"
            />
          </OakBox>
        ) : (
          <MemoizedReactMarkdownWithStyles
            markdown={questionWithInstruction}
            className="[&>p]:mb-0"
          />
        )}
      </OakFlex>

      {!hasInlineAnswer && (
        <OakBox $mb="space-between-m">
          <OakBox
            $font="body-2-bold"
            $color="icon-success"
            className="inline-block border-b-2 border-gray-800"
          >
            {displayAnswer}
          </OakBox>
        </OakBox>
      )}
    </OakBox>
  );
};
