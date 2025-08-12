import { useMemo } from "react";

import type { QuizV2QuestionOrder } from "@oakai/aila/src/protocol/schema";
import { addInstruction } from "@oakai/exports/src/quiz-utils/formatting";
import { shuffleOrderItems } from "@oakai/exports/src/quiz-utils/shuffle";

import { OakBox, OakFlex } from "@oaknational/oak-components";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";

import { AnswerBox } from "./AnswerBox";

type OrderQuestionProps = {
  question: QuizV2QuestionOrder;
  questionNumber: number;
};

export const OrderQuestion = ({
  question,
  questionNumber,
}: OrderQuestionProps) => {
  const shuffledItems = useMemo(
    () => shuffleOrderItems(question.items),
    [question.items],
  );

  // Add instruction to question
  const questionWithInstruction = addInstruction(
    question.question,
    "Write the correct number in each box.",
  );

  return (
    <OakBox
      $mb="space-between-l"
      role="group"
      aria-label={`Question ${questionNumber}: Ordering`}
    >
      <OakFlex $mb="space-between-s">
        <OakBox className="leading-[26px]">{questionNumber}.&nbsp;</OakBox>
        <MemoizedReactMarkdownWithStyles
          markdown={questionWithInstruction}
          className="[&>p]:mb-0"
        />
      </OakFlex>

      <OakBox role="list" aria-label="Items to order">
        {shuffledItems.map((item, index) => (
          <OakFlex
            key={index}
            $alignItems="center"
            $mb="space-between-xs"
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
    </OakBox>
  );
};
