import { useMemo } from "react";

import type {
  ImageMetadata,
  QuizV2QuestionMultipleChoice,
} from "@oakai/aila/src/protocol/schema";
import { addInstruction } from "@oakai/exports/src/quiz-utils/formatting";
import { shuffleMultipleChoiceAnswers } from "@oakai/exports/src/quiz-utils/shuffle";

import { OakBox, OakFlex } from "@oaknational/oak-components";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";

import { AnswerBox } from "./AnswerBox";
import { useTextWithBlanks } from "./textWithBlanks";

type MultipleChoiceQuestionProps = {
  question: QuizV2QuestionMultipleChoice;
  questionNumber: number;
  imageMetadata: ImageMetadata[];
};

export const MultipleChoiceQuestion = ({
  question,
  questionNumber,
  imageMetadata,
}: MultipleChoiceQuestionProps) => {
  const answers = useMemo(
    () => shuffleMultipleChoiceAnswers(question.answers, question.distractors),
    [question.answers, question.distractors],
  );

  const questionWithInstruction = addInstruction(
    question.question,
    `Tick ${question.answers.length > 1 ? `${question.answers.length} correct answers` : "1 correct answer"}.`,
  );

  const { processedText, components } = useTextWithBlanks({
    questionText: questionWithInstruction,
  });

  return (
    <OakBox
      $mb="space-between-l"
      role="group"
      aria-label={`Question ${questionNumber}: Multiple choice`}
    >
      <OakFlex $mb="space-between-s">
        <OakBox className="leading-[26px]">{questionNumber}.&nbsp;</OakBox>
        <MemoizedReactMarkdownWithStyles
          markdown={processedText}
          className="[&>p]:mb-0"
          components={components}
          imageDimensions={imageMetadata}
        />
      </OakFlex>

      <OakBox>
        {answers.map((answer, index) => {
          const letter = String.fromCharCode(97 + index);
          return (
            <OakFlex
              key={index}
              $alignItems="flex-start"
              $mb="space-between-xs"
              aria-label={`Option ${letter}: ${answer.text}${
                answer.isCorrect ? ", correct answer" : ""
              }`}
            >
              <AnswerBox>{answer.isCorrect && <AnswerBox.Check />}</AnswerBox>
              <OakBox
                $font={answer.isCorrect ? "body-2-bold" : "body-2"}
                className="pt-[2px]"
              >
                <MemoizedReactMarkdownWithStyles
                  markdown={`${letter}) ${answer.text}`}
                  className="[&>p]:mb-0 [&>p]:inline"
                  imageDimensions={imageMetadata}
                />
              </OakBox>
            </OakFlex>
          );
        })}
      </OakBox>
    </OakBox>
  );
};
