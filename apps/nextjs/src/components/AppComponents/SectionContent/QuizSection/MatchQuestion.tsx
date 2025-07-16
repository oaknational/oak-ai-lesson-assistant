import type { QuizV2QuestionMatch } from "@oakai/aila/src/protocol/schema";

import { OakBox, OakFlex } from "@oaknational/oak-components";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";

import { AnswerCheckbox } from "./AnswerCheckbox";
import { addInstruction } from "./helpers";
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

  // Add instruction to question
  const questionWithInstruction = addInstruction(
    question.question,
    "Write the matching letter in each box.",
  );

  return (
    <OakBox $mb="space-between-l">
      <OakFlex $mb="space-between-s">
        <OakBox className="leading-[26px]">{questionNumber}.&nbsp;</OakBox>
        <MemoizedReactMarkdownWithStyles
          markdown={questionWithInstruction}
          className="[&>p]:mb-0"
        />
      </OakFlex>

      {/* Desktop layout */}
      <OakFlex
        $gap="space-between-xl"
        $flexWrap="wrap"
        $display={["none", "flex"]}
      >
        {/* Left column */}
        <OakBox $minWidth="all-spacing-15">
          {question.pairs.map((pair, index) => {
            return (
              <OakFlex
                key={index}
                $alignItems="center"
                $mb="space-between-s"
                $minHeight="all-spacing-7"
              >
                <MemoizedReactMarkdownWithStyles
                  markdown={`${String.fromCharCode(97 + index)}) ${pair.left}`}
                  className="[&>p]:mb-0 [&>p]:inline"
                />
              </OakFlex>
            );
          })}
        </OakBox>

        {/* Right column */}
        <OakBox>
          {shuffledRight.map((item, index) => (
            <OakFlex
              key={index}
              $alignItems="center"
              $mb="space-between-s"
              $minHeight="all-spacing-7"
            >
              <AnswerCheckbox>{item.label}</AnswerCheckbox>
              <OakBox>
                <MemoizedReactMarkdownWithStyles
                  markdown={item.text}
                  className="[&>p]:mb-0 [&>p]:inline"
                />
              </OakBox>
            </OakFlex>
          ))}
        </OakBox>
      </OakFlex>

      {/* Mobile layout: interleaved with correct answer pairings */}
      <OakBox $display={["block", "none"]}>
        {question.pairs.map((pair, pairIndex) => {
          // Find the corresponding answer with its shuffled label
          const answerItem = shuffledRight.find(
            (item) => item.text === pair.right,
          );

          return (
            <OakBox key={pairIndex} $mb="space-between-m">
              {/* Question */}
              <OakBox $mb="space-between-xs">
                <MemoizedReactMarkdownWithStyles
                  markdown={`${String.fromCharCode(97 + pairIndex)}) ${pair.left}`}
                  className="[&>p]:mb-0 [&>p]:inline"
                />
              </OakBox>

              {/* Correct answer with left margin */}
              {answerItem && (
                <OakBox $ml="space-between-l">
                  <MemoizedReactMarkdownWithStyles
                    markdown={`**${answerItem.text}**`}
                    className="[&>p]:mb-0 [&>p]:inline"
                  />
                </OakBox>
              )}
            </OakBox>
          );
        })}
      </OakBox>
    </OakBox>
  );
};
