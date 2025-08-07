import { useMemo } from "react";
import type { Components } from "react-markdown";

import type { QuizV2QuestionShortAnswer } from "@oakai/aila/src/protocol/schema";

import { OakBox, OakFlex, OakSpan } from "@oaknational/oak-components";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";

import { addInstruction } from "./helpers";

type ShortAnswerQuestionProps = {
  question: QuizV2QuestionShortAnswer;
  questionNumber: number;
};

// Create custom components for inline answer rendering
const getInlineAnswerComponents = (answer: string): Partial<Components> => ({
  em: ({ children }) => {
    const isInlineAnswer = children?.toString() === "{{}}";
    if (isInlineAnswer) {
      return (
        <OakSpan
          $ba="border-solid-m"
          $borderColor="border-primary"
          $font="body-2-bold"
          $color="text-success"
          $borderStyle="none none solid none"
          aria-label={`blank filled with: ${answer}`}
          role="insertion"
        >
          {answer}
        </OakSpan>
      );
    }

    // Regular italic text
    return <em>{children}</em>;
  },
});

export const ShortAnswerQuestion = ({
  question,
  questionNumber,
}: ShortAnswerQuestionProps) => {
  const hasInlineAnswer = question.question.includes("{{}}");
  const answer = question.answers?.[0] ?? "";

  const questionText = addInstruction(
    // Wrap {{}} in italics. We can intercept with a custom em component
    question.question.replace("{{}}", "_{{}}_ "),
    "Fill in the blank.",
  );

  const customComponents = useMemo(
    () => getInlineAnswerComponents(answer),
    [answer],
  );

  return (
    <OakBox
      $mb="space-between-l"
      role="group"
      aria-label={`Question ${questionNumber}: Short answer`}
    >
      <OakFlex $mb="space-between-s">
        <OakBox className="leading-[26px]">{questionNumber}.&nbsp;</OakBox>
        <MemoizedReactMarkdownWithStyles
          markdown={questionText}
          className="[&>p]:mb-0"
          components={customComponents}
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
