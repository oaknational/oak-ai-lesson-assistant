import type { LatestQuizQuestion } from "@oakai/aila/src/protocol/schema";
import { addInstruction } from "@oakai/exports/src/quiz-utils/formatting";

import { OakBox } from "@oaknational/oak-components";

import { QuestionWrapper } from "./QuestionWrapper";
import { hasBlankSpaces, useTextWithBlanks } from "./textWithBlanks";

const INSTRUCTION = "Fill in the blank.";

type ShortAnswerQuestionProps = {
  question: Extract<LatestQuizQuestion, { questionType: "short-answer" }>;
  questionNumber: number;
  quizType?: "starterQuiz" | "exitQuiz";
  questionIndex?: number;
};

export const ShortAnswerQuestion = ({
  question,
  questionNumber,
  quizType,
  questionIndex,
}: ShortAnswerQuestionProps) => {
  const hasInlineAnswer = hasBlankSpaces(question.question);
  const answer = question.answers?.[0] ?? "";

  const questionWithInstruction = addInstruction(
    question.question,
    INSTRUCTION,
  );

  const { processedText, components } = useTextWithBlanks({
    questionText: questionWithInstruction,
    fillAnswer: answer,
  });

  return (
    <QuestionWrapper
      questionNumber={questionNumber}
      questionType="Short answer"
      quizType={quizType}
      questionIndex={questionIndex}
      question={question}
      questionText={processedText}
      markdownComponents={components}
    >
      {!hasInlineAnswer && (
        <OakBox $mb="spacing-24" aria-label="Answer">
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
    </QuestionWrapper>
  );
};
