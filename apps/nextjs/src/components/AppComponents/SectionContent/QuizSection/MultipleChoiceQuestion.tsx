import type { QuizV2QuestionMultipleChoice } from "@oakai/aila/src/protocol/schema";

import { OakBox, OakFlex, OakIcon } from "@oaknational/oak-components";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";

import { shuffleMultipleChoiceAnswers } from "./shuffle";

type MultipleChoiceQuestionProps = {
  question: QuizV2QuestionMultipleChoice;
  questionNumber: number;
};

type AnswerCheckboxProps = {
  isChecked: boolean;
};

const AnswerCheckbox = ({ isChecked }: AnswerCheckboxProps) => {
  return (
    <OakFlex
      $mr="space-between-xs"
      $width="all-spacing-7"
      $height="all-spacing-7"
      $ba="border-solid-m"
      $borderColor="black"
      $flexShrink="0"
    >
      {isChecked && (
        <OakIcon
          iconName="tick"
          $width="100%"
          $height="100%"
          $color="text-inverted"
          $transform="scale(1.15)"
        />
      )}
    </OakFlex>
  );
};
export const MultipleChoiceQuestion = ({
  question,
  questionNumber,
}: MultipleChoiceQuestionProps) => {
  const answers = shuffleMultipleChoiceAnswers(
    question.answers,
    question.distractors,
  );

  return (
    <OakBox $mb="space-between-l">
      <OakFlex $mb="space-between-s">
        <OakBox className="leading-[26px]">{questionNumber}.&nbsp;</OakBox>
        <MemoizedReactMarkdownWithStyles
          markdown={question.question}
          className="[&>p]:mb-0"
        />
      </OakFlex>

      {question.hint && (
        <OakBox $mb="space-between-s" $color="text-subdued">
          <MemoizedReactMarkdownWithStyles
            markdown={question.hint}
            className="[&>p]:mb-0"
          />
        </OakBox>
      )}

      <OakBox>
        {answers.map((answer, index) => (
          <OakFlex key={index} $alignItems="flex-start" $mb="space-between-xs">
            <AnswerCheckbox isChecked={answer.isCorrect} />
            <OakBox
              $font={answer.isCorrect ? "body-2-bold" : "body-2"}
              className="pt-[2px]"
            >
              <MemoizedReactMarkdownWithStyles
                markdown={`${String.fromCharCode(97 + index)}) ${answer.text}`}
                className="[&>p]:mb-0 [&>p]:inline"
              />
            </OakBox>
          </OakFlex>
        ))}
      </OakBox>
    </OakBox>
  );
};
