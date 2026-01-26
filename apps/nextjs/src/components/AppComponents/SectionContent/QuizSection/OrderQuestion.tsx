import { useMemo } from "react";

import type { LatestQuizQuestion } from "@oakai/aila/src/protocol/schema";
import { addInstruction } from "@oakai/exports/src/quiz-utils/formatting";
import { shuffleOrderItems } from "@oakai/exports/src/quiz-utils/shuffle";

import { OakBox, OakFlex } from "@oaknational/oak-components";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";

import { AnswerBox } from "./AnswerBox";
import { QuestionWrapper } from "./QuestionWrapper";
import { useTextWithBlanks } from "./textWithBlanks";

const INSTRUCTION = "Write the correct number in each box.";

type OrderQuestionProps = {
  question: Extract<LatestQuizQuestion, { questionType: "order" }>;
  questionNumber: number;
  quizType?: "starterQuiz" | "exitQuiz";
  questionIndex?: number;
};

export const OrderQuestion = ({
  question,
  questionNumber,
  quizType,
  questionIndex,
}: OrderQuestionProps) => {
  const shuffledItems = useMemo(
    () => shuffleOrderItems(question.items),
    [question.items],
  );

  const questionWithInstruction = addInstruction(
    question.question,
    INSTRUCTION,
  );

  const { processedText, components } = useTextWithBlanks({
    questionText: questionWithInstruction,
  });

  return (
    <QuestionWrapper
      questionNumber={questionNumber}
      questionType="Ordering"
      quizType={quizType}
      questionIndex={questionIndex}
      question={question}
      questionText={processedText}
      markdownComponents={components}
    >
      <OakBox role="list" aria-label="Items to order">
        {shuffledItems.map((item, index) => (
          <OakFlex
            key={index}
            $alignItems="center"
            $mb="spacing-12"
            role="listitem"
            aria-label={`Item in position ${item.correctIndex}: ${item.text}`}
          >
            <AnswerBox>{item.correctIndex}</AnswerBox>
            <OakBox $font="body-2">
              <MemoizedReactMarkdownWithStyles
                markdown={item.text}
                className="[&>p]:mb-0 [&>p]:inline"
              />
            </OakBox>
          </OakFlex>
        ))}
      </OakBox>
    </QuestionWrapper>
  );
};
