import type { QuizV2QuestionMatch } from "@oakai/aila/src/protocol/schema";

import { OakBox, OakFlex } from "@oaknational/oak-components";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";

import { AnswerBox } from "./AnswerBox";
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
    <OakBox
      $mb="space-between-l"
      role="group"
      aria-label={`Question ${questionNumber}: Matching`}
    >
      <OakFlex $mb="space-between-s">
        <OakBox className="leading-[26px]">{questionNumber}.&nbsp;</OakBox>
        <MemoizedReactMarkdownWithStyles
          markdown={questionWithInstruction}
          className="[&>p]:mb-0"
        />
      </OakFlex>

      <OakFlex
        $gap={["space-between-s", "space-between-l"]}
        $flexDirection={["column", "row"]}
        role="group"
        aria-label="Matching exercise"
      >
        {/* Left column - questions */}
        <OakBox
          $minWidth={["auto", "all-spacing-15"]}
          role="list"
          aria-label="Items to match"
        >
          {question.pairs.map((pair, index) => {
            const letter = String.fromCharCode(97 + index);
            return (
              <OakFlex
                key={index}
                $alignItems="center"
                $mb="space-between-s"
                $minHeight="all-spacing-7"
                role="listitem"
                aria-label={`Match item ${letter}: ${pair.left}`}
              >
                <MemoizedReactMarkdownWithStyles
                  markdown={`${letter}) ${pair.left}`}
                  className="[&>p]:mb-0 [&>p]:inline"
                />
              </OakFlex>
            );
          })}
        </OakBox>

        {/* Right column - answers */}
        <OakBox role="list" aria-label="Answer options">
          {shuffledRight.map((item, index) => (
            <OakFlex
              key={index}
              $alignItems="center"
              $mb="space-between-s"
              $minHeight="all-spacing-7"
              role="listitem"
              aria-label={`Matches with ${item.label}: ${item.text}`}
            >
              <AnswerBox wobbleOffset={index}>{item.label}</AnswerBox>
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
    </OakBox>
  );
};
