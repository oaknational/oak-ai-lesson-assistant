import {
  OakCodeRenderer,
  OakFlex,
  OakIcon,
  OakP,
  OakSpan,
} from "@oaknational/oak-components";
import { VisuallyHidden } from "@radix-ui/themes";

import type { MatchAnswer } from "../quizTypes";
import { removeMarkdown } from "../quizUtils";

export const QuizQuestionsMatchAnswers = ({
  answers,
  questionNumber,
}: {
  answers: MatchAnswer[];
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
      {answers.map((item, i) => {
        const matchOption = item.matchOption?.[0];
        const correctChoice = item.correctChoice[0];
        return (
          matchOption &&
          correctChoice && (
            <OakFlex
              $ph="inner-padding-xs"
              $borderRadius="border-radius-m2"
              role="listitem"
              key={`q-${questionNumber}-answer${i}`}
              $background={"lemon50"}
            >
              <VisuallyHidden>
                Correct Answer:
                {removeMarkdown(matchOption.text)},
                {removeMarkdown(correctChoice.text)}
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
                    string={removeMarkdown(matchOption.text)}
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
                    string={removeMarkdown(correctChoice.text)}
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
