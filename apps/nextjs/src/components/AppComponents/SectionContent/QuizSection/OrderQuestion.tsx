import type { QuizV2QuestionOrder } from "@oakai/aila/src/protocol/schema";

import { OakBox, OakFlex } from "@oaknational/oak-components";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";

type OrderQuestionProps = {
  question: QuizV2QuestionOrder;
  questionNumber: number;
};

export const OrderQuestion = ({
  question,
  questionNumber,
}: OrderQuestionProps) => {
  return (
    <OakBox $mb="space-between-l">
      <OakFlex $mb="space-between-s">
        <OakBox className="leading-[26px]">{questionNumber}.&nbsp;</OakBox>
        <MemoizedReactMarkdownWithStyles
          markdown={question.question}
          className="[&>p]:mb-0"
        />
      </OakFlex>

      <OakBox $ml="space-between-l">
        {question.items.map((item, index) => (
          <OakFlex key={index} $alignItems="center" $mb="space-between-s">
            <OakFlex
              $ba="border-solid-m"
              $borderColor="black"
              $width="all-spacing-7"
              $height="all-spacing-7"
              $mr="space-between-m"
              $alignItems="center"
              $justifyContent="center"
            >
              <OakBox $font="body-2-bold">[{index + 1}]</OakBox>
            </OakFlex>
            <MemoizedReactMarkdownWithStyles
              markdown={item}
              className="[&>p]:mb-0"
            />
          </OakFlex>
        ))}
      </OakBox>
    </OakBox>
  );
};
