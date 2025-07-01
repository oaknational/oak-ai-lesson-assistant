import type {
  QuizV2,
  QuizV2QuestionMultipleChoice,
} from "@oakai/aila/src/protocol/schema";

import { OakBox, OakFlex, OakIcon, OakP } from "@oaknational/oak-components";

import { shuffleMultipleChoiceAnswers } from "./shuffle";

export type QuizSectionProps = {
  quiz: QuizV2;
};

type MultipleChoiceQuestionProps = {
  question: QuizV2QuestionMultipleChoice;
};

const MultipleChoiceQuestion = ({
  question,
  questionNumber,
}: MultipleChoiceQuestionProps & { questionNumber: number }) => {
  const answers = shuffleMultipleChoiceAnswers(
    question.answers,
    question.distractors,
  );

  const correctAnswerCount = question.answers.length;

  const ensureEndsWithPeriod = (text: string) => {
    const endsWithPunctuation = /[.!?]$/.test(text);
    return endsWithPunctuation ? text : `${text}.`;
  };

  const tickInstruction = `Tick ${correctAnswerCount} correct answer${correctAnswerCount !== 1 ? "s" : ""}.`;
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

export const QuizSection = ({ quiz }: QuizSectionProps) => {
  return (
    <>
      {quiz.questions.map((question, index) => {
        if (question.questionType === "multiple-choice") {
          return (
            <MultipleChoiceQuestion
              key={index}
              question={question}
              questionNumber={index + 1}
            />
          );
        }
        return null;
      })}
    </>
  );
};
