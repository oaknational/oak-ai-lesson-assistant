import {
  OakCodeRenderer,
  OakFlex,
  OakIcon,
  OakP,
  OakSpan,
} from "@oaknational/oak-components";
import { VisuallyHidden } from "@radix-ui/themes";

import { z } from "zod";
import type { QuizV2QuestionMatchSchema } from "@oakai/aila/src/protocol/schemas/quiz/quizV2";
import { removeMarkdown } from "../quizUtils";

export const QuizQuestionsMatchAnswers = ({
  pairs,
  questionNumber,
}: {
  pairs: z.infer<typeof QuizV2QuestionMatchSchema>["pairs"];
  questionNumber: number;
}) => {
  return (
    <OakFlex
      $flexDirection={"column"}
      $gap="all-spacing-1"
      $alignItems={"start"}
      role="list"
      $width={"100%"}
    >
      {pairs.map((pair, i) => {
        const leftText = pair.left.find(item => item.type === "text")?.text;
        const rightText = pair.right.find(item => item.type === "text")?.text;
        return (
          leftText &&
          rightText && (
            <OakFlex
              $ph="inner-padding-xs"
              $borderRadius="border-radius-m2"
              role="listitem"
              key={`q-${questionNumber}-answer${i}`}
              $background={"lemon50"}
            >
              <VisuallyHidden>
                Correct Answer:
                {removeMarkdown(leftText)},
                {removeMarkdown(rightText)}
              </VisuallyHidden>
              <OakIcon
                $mr={"space-between-ssx"}
                iconName={"tick"}
                $width={"all-spacing-6"}
                $height={"all-spacing-6"}
              />
              <OakFlex
                $flexWrap={"wrap"}
                $width={["100%", "100%", "max-content"]}
              >
                <OakP
                  $whiteSpace={"nowrap"}
                  $font={["body-2-bold", "body-1-bold"]}
                  aria-hidden
                >
                  <OakCodeRenderer
                    string={removeMarkdown(leftText)}
                    $font="code-3"
                    $mt={"space-between-none"}
                  />
                  <OakSpan>{" -"}&nbsp;</OakSpan>
                </OakP>
                <OakP
                  $whiteSpace={["break-spaces", "nowrap"]}
                  $font={["body-2", "body-1"]}
                >
                  <OakCodeRenderer
                    string={removeMarkdown(rightText)}
                    $font="code-3"
                    $mt={"space-between-none"}
                  />
                </OakP>
              </OakFlex>
            </OakFlex>
          )
        );
      })}
    </OakFlex>
  );
};
