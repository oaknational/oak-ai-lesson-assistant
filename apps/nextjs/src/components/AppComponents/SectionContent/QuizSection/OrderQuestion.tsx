import type { QuizV2QuestionOrder } from "@oakai/aila/src/protocol/schema";

import { OakBox, OakFlex } from "@oaknational/oak-components";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";

import { AnswerCheckbox } from "./AnswerCheckbox";
import { shuffleOrderItems } from "./shuffle";

type OrderQuestionProps = {
  question: QuizV2QuestionOrder;
  questionNumber: number;
};

export const OrderQuestion = ({
  question,
  questionNumber,
}: OrderQuestionProps) => {
  const shuffledItems = shuffleOrderItems(question.items);
  return (
    <OakBox $mb="space-between-l">
      <OakFlex $mb="space-between-s">
        <OakBox className="leading-[26px]">{questionNumber}.&nbsp;</OakBox>
        <MemoizedReactMarkdownWithStyles
          markdown={question.question}
          className="[&>p]:mb-0"
        />
      </OakFlex>

      <OakBox>
        {shuffledItems.map((item, index) => (
          <OakFlex key={index} $alignItems="flex-start" $mb="space-between-xs">
            <AnswerCheckbox>{item.correctIndex}</AnswerCheckbox>
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
