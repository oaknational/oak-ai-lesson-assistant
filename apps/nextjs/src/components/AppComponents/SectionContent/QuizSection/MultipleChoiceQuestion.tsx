import type { QuizV2QuestionMultipleChoice } from "@oakai/aila/src/protocol/schema";

import { OakBox, OakFlex, OakIcon, OakP } from "@oaknational/oak-components";

import { shuffleMultipleChoiceAnswers } from "./shuffle";

type MultipleChoiceQuestionProps = {
  question: QuizV2QuestionMultipleChoice;
  questionNumber: number;
};

export const MultipleChoiceQuestion = ({
  question,
  questionNumber,
}: MultipleChoiceQuestionProps) => {
  const answers = shuffleMultipleChoiceAnswers(
    question.answers,
    question.distractors,
  );

  const ensureEndsWithPeriod = (text: string) => {
    const endsWithPunctuation = /[.!?]$/.test(text);
    return endsWithPunctuation ? text : `${text}.`;
  };

  // NOTE: Tick instruction suppressed until design requirement is confirmed
  // const correctAnswerCount = question.answers.length;
  // const tickInstruction = `Tick ${correctAnswerCount} correct answer${correctAnswerCount !== 1 ? "s" : ""}.`;
  const tickInstruction = "";
  const fullQuestionText = `${questionNumber}. ${ensureEndsWithPeriod(question.question)} ${tickInstruction}`;

  return (
    <OakBox $mb="space-between-l">
      <OakP $mb="space-between-s">{fullQuestionText}</OakP>

      {question.hint && (
        <OakP $mb="space-between-s" $color="text-subdued">
          {question.hint}
        </OakP>
      )}

      <OakBox>
        {answers.map((answer, index) => (
          <OakFlex key={index} $alignItems="center" $mb="space-between-xs">
            <OakBox
              $mr="space-between-xs"
              $width="all-spacing-7"
              $height="all-spacing-7"
              $ba="border-solid-m"
              $borderColor="black"
            >
              {answer.isCorrect && (
                <OakIcon
                  iconName="tick"
                  $width="100%"
                  $height="100%"
                  $color="text-inverted"
                  $transform="scale(1.15)"
                />
              )}
            </OakBox>
            <OakP $font={answer.isCorrect ? "body-2-bold" : "body-2"}>
              {String.fromCharCode(97 + index)}) {answer.text}
            </OakP>
          </OakFlex>
        ))}
      </OakBox>
    </OakBox>
  );
};
