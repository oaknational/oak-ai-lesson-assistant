import { useMemo } from "react";

import type { LatestQuizQuestion } from "@oakai/aila/src/protocol/schema";
import { addInstruction } from "@oakai/exports/src/quiz-utils/formatting";
import { shuffleOrderItems } from "@oakai/exports/src/quiz-utils/shuffle";

import { OakBox, OakFlex } from "@oaknational/oak-components";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";

import { AnswerBox } from "./AnswerBox";
import { useTextWithBlanks } from "./textWithBlanks";

type OrderQuestionProps = {
  question: Extract<LatestQuizQuestion, { questionType: "order" }>;
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

  const { processedText, components } = useTextWithBlanks({
    questionText: questionWithInstruction,
  });

  return (
    <OakBox
      $mb="spacing-48"
      role="group"
      aria-label={`Question ${questionNumber}: Ordering`}
    >
      <OakFlex $mb="spacing-16">
        <OakBox className="leading-[26px]">{questionNumber}.&nbsp;</OakBox>
        <MemoizedReactMarkdownWithStyles
          markdown={processedText}
          className="[&>p]:mb-0"
          components={components}
        />
      </OakFlex>

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
    </OakBox>
  );
};
