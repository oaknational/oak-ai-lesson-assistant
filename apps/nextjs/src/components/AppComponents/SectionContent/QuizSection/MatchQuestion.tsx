import type { QuizV2QuestionMatch } from "@oakai/aila/src/protocol/schema";

import { OakBox, OakFlex } from "@oaknational/oak-components";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";

import { shuffleMatchItems } from "./shuffle";

type MatchQuestionProps = {
  question: QuizV2QuestionMatch;
  questionNumber: number;
};

export const MatchQuestion = ({
  question,
  questionNumber,
}: MatchQuestionProps) => {
  // Extract right side items and shuffle them
  const rightItems = question.pairs.map((pair) => pair.right);
  const shuffledRight = shuffleMatchItems(rightItems);

  return (
    <OakBox $mb="space-between-l">
      <OakFlex $mb="space-between-s">
        <OakBox className="leading-[26px]">{questionNumber}.&nbsp;</OakBox>
        <MemoizedReactMarkdownWithStyles
          markdown={question.question}
          className="[&>p]:mb-0"
        />
      </OakFlex>

      <OakFlex $gap="space-between-m" $flexWrap="wrap">
        {/* Left column */}
        <OakBox $minWidth="all-spacing-20">
          {question.pairs.map((pair, index) => {
            const correctLabel =
              shuffledRight.find((r) => r.text === pair.right)?.label || "";
            return (
              <OakFlex key={index} $alignItems="center" $mb="space-between-s">
                <MemoizedReactMarkdownWithStyles
                  markdown={`${String.fromCharCode(97 + index)}) ${pair.left}`}
                  className="[&>p]:mb-0 [&>p]:inline"
                />
                <OakBox
                  $ml="space-between-m"
                  $mr="space-between-m"
                  $font="body-2-bold"
                >
                  [{correctLabel}]
                </OakBox>
              </OakFlex>
            );
          })}
        </OakBox>

        {/* Right column */}
        <OakBox $minWidth="all-spacing-20">
          {shuffledRight.map((item, index) => (
            <OakBox key={index} $mb="space-between-s">
              <MemoizedReactMarkdownWithStyles
                markdown={`[${item.label}] ${item.text}`}
                className="[&>p]:mb-0 [&>p]:inline"
              />
            </OakBox>
          ))}
        </OakBox>
      </OakFlex>
    </OakBox>
  );
};
