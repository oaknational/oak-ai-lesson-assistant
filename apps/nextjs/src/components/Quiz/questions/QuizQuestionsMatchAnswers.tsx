import {
  OakCodeRenderer,
  OakFlex,
  OakIcon,
  OakP,
  OakSpan,
} from "@oaknational/oak-components";
import { VisuallyHidden } from "@radix-ui/themes";

import type { z } from "zod";
import type { QuizV2QuestionMatchSchema } from "@oakai/aila/src/protocol/schemas/quiz/quizV2";
import { removeMarkdown, shuffleMatchingPairs } from "../utils";

export const QuizQuestionsMatchAnswers = ({
  pairs,
  questionNumber,
}: {
  pairs: z.infer<typeof QuizV2QuestionMatchSchema>["pairs"];
  questionNumber: number;
}) => {
  // Shuffle pairs to match student view while keeping answer indicators
  const { leftItems, rightItems } = shuffleMatchingPairs(pairs);
  
  // Create mapping from original pairs to track correct matches
  const correctMatches = new Map();
  pairs.forEach((pair, originalIndex) => {
    const leftText = pair.left.find(item => item.type === "text")?.text;
    const rightText = pair.right.find(item => item.type === "text")?.text;
    if (leftText && rightText) {
      correctMatches.set(leftText, { rightText, originalIndex });
    }
  });

  return (
    <OakFlex
      $flexDirection={"row"}
      $gap="all-spacing-4"
      $alignItems={"start"}
      role="list"
      $width={"100%"}
    >
      {/* Left column */}
      <OakFlex $flexDirection={"column"} $gap="all-spacing-1" $flexGrow={1}>
        {leftItems.map((leftItem, i) => {
          const leftText = leftItem.find(item => item.type === "text")?.text;
          const matchInfo = leftText ? correctMatches.get(leftText) : null;
          const leftLabel = String.fromCharCode(65 + i); // A, B, C, etc.
          
          return leftText ? (
            <OakFlex
              key={`q-${questionNumber}-left-${i}`}
              $ph="inner-padding-xs"
              $borderRadius="border-radius-m2"
              $background={"lemon50"}
              $alignItems={"center"}
              role="listitem"
            >
              <OakIcon
                $mr={"space-between-ssx"}
                iconName={"tick"}
                $width={"all-spacing-6"}
                $height={"all-spacing-6"}
              />
              <OakP $font={["body-2-bold", "body-1-bold"]} $mr="space-between-xs">
                {leftLabel}.
              </OakP>
              <OakCodeRenderer
                string={removeMarkdown(leftText)}
                $font="code-3"
                $mt={"space-between-none"}
              />
            </OakFlex>
          ) : null;
        })}
      </OakFlex>

      {/* Right column */}
      <OakFlex $flexDirection={"column"} $gap="all-spacing-1" $flexGrow={1}>
        {rightItems.map((rightItem, i) => {
          const rightText = rightItem.find(item => item.type === "text")?.text;
          const rightLabel = (i + 1).toString(); // 1, 2, 3, etc.
          
          // Find which left item this right item matches with
          let matchingLeftLabel = "";
          for (const [leftText, matchInfo] of correctMatches.entries()) {
            if (matchInfo.rightText === rightText) {
              const leftIndex = leftItems.findIndex(item => 
                item.find(contentItem => contentItem.type === "text")?.text === leftText
              );
              if (leftIndex !== -1) {
                matchingLeftLabel = String.fromCharCode(65 + leftIndex);
                break;
              }
            }
          }
          
          return rightText ? (
            <OakFlex
              key={`q-${questionNumber}-right-${i}`}
              $ph="inner-padding-xs"
              $borderRadius="border-radius-m2"
              $background={"lemon50"}
              $alignItems={"center"}
              role="listitem"
            >
              <OakIcon
                $mr={"space-between-ssx"}
                iconName={"tick"}
                $width={"all-spacing-6"}
                $height={"all-spacing-6"}
              />
              <OakP $font={["body-2-bold", "body-1-bold"]} $mr="space-between-xs">
                {rightLabel}. ({matchingLeftLabel})
              </OakP>
              <OakCodeRenderer
                string={removeMarkdown(rightText)}
                $font="code-3"
                $mt={"space-between-none"}
              />
              <VisuallyHidden>
                Matches with {matchingLeftLabel}
              </VisuallyHidden>
            </OakFlex>
          ) : null;
        })}
      </OakFlex>
    </OakFlex>
  );
};
