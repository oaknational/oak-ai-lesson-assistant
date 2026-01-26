import { useMemo } from "react";

import type { LatestQuizQuestion } from "@oakai/aila/src/protocol/schema";
import { hasImageOnlyAnswers } from "@oakai/exports/src/gSuite/docs/quiz/table-generators/helpers";
import { addInstruction } from "@oakai/exports/src/quiz-utils/formatting";
import { shuffleMultipleChoiceAnswers } from "@oakai/exports/src/quiz-utils/shuffle";

import { OakBox, OakFlex } from "@oaknational/oak-components";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";

import { AnswerBox } from "../AnswerBox";
import { QuestionWrapper } from "../QuestionWrapper";
import { useTextWithBlanks } from "../textWithBlanks";
import { ImageOnlyAnswerLayout } from "./ImageOnlyAnswerLayout";

const INSTRUCTION = (answerCount: number) =>
  `Tick ${answerCount > 1 ? `${answerCount} correct answers` : "1 correct answer"}.`;

type MultipleChoiceQuestionProps = {
  question: Extract<LatestQuizQuestion, { questionType: "multiple-choice" }>;
  questionNumber: number;
  quizType?: "starterQuiz" | "exitQuiz";
  questionIndex?: number;
};

export const MultipleChoiceQuestion = ({
  question,
  questionNumber,
  quizType,
  questionIndex,
}: MultipleChoiceQuestionProps) => {
  const answers = useMemo(
    () => shuffleMultipleChoiceAnswers(question.answers, question.distractors),
    [question.answers, question.distractors],
  );

  const questionWithInstruction = addInstruction(
    question.question,
    INSTRUCTION(question.answers.length),
  );

  const { processedText, components } = useTextWithBlanks({
    questionText: questionWithInstruction,
  });

  const isImageOnlyAnswers = hasImageOnlyAnswers(
    question.answers,
    question.distractors,
  );

  return (
    <QuestionWrapper
      questionNumber={questionNumber}
      questionType="Multiple choice"
      quizType={quizType}
      questionIndex={questionIndex}
      question={question}
      questionText={processedText}
      markdownComponents={components}
    >
      {isImageOnlyAnswers ? (
        <ImageOnlyAnswerLayout answers={answers} />
      ) : (
        <OakBox>
          {answers.map((answer, index) => {
            const letter = String.fromCharCode(97 + index);
            return (
              <OakFlex
                key={index}
                $alignItems="flex-start"
                $mb="spacing-12"
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
                  />
                </OakBox>
              </OakFlex>
            );
          })}
        </OakBox>
      )}
    </QuestionWrapper>
  );
};
