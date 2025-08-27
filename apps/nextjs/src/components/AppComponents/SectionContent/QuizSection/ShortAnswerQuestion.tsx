import type { QuizV2QuestionShortAnswer } from "@oakai/aila/src/protocol/schema";

import { OakBox, OakFlex } from "@oaknational/oak-components";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";

import { addInstruction } from "./helpers";
import { hasBlankSpaces, useTextWithBlanks } from "./textWithBlanks";

type ShortAnswerQuestionProps = {
  question: QuizV2QuestionShortAnswer;
  questionNumber: number;
};

export const ShortAnswerQuestion = ({
  question,
  questionNumber,
}: ShortAnswerQuestionProps) => {
  const hasInlineAnswer = hasBlankSpaces(question.question);
  const answer = question.answers?.[0] ?? "";

  const questionWithInstruction = addInstruction(
    question.question,
    "Fill in the blank.",
  );

  const { processedText, components } = useTextWithBlanks({
    questionText: questionWithInstruction,
    fillAnswer: answer,
  });

  return (
    <OakBox
      $mb="space-between-l"
      role="group"
      aria-label={`Question ${questionNumber}: Short answer`}
    >
      <OakFlex $mb="space-between-s">
        <OakBox className="leading-[26px]">{questionNumber}.&nbsp;</OakBox>
        <MemoizedReactMarkdownWithStyles
          markdown={processedText}
          className="[&>p]:mb-0"
          components={components}
        />
      </OakFlex>

      {!hasInlineAnswer && (
        <OakBox $mb="space-between-m" aria-label="Answer">
          <OakBox
            $font="body-2-bold"
            $color="text-success"
            $display="inline-block"
            $ba="border-solid-m"
            $borderColor="border-primary"
            $borderStyle="none none solid none"
            aria-label={`Correct answer: ${answer}`}
          >
            {answer}
          </OakBox>
        </OakBox>
      )}
    </OakBox>
  );
};
