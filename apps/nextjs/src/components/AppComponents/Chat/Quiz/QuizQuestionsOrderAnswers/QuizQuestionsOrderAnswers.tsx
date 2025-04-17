import {
  OakBox,
  OakCodeRenderer,
  OakFlex,
  OakIcon,
  OakTypography,
} from "@oaknational/oak-components";
import { VisuallyHidden } from "@radix-ui/themes";

import type { OrderAnswer } from "../quizTypes";
import { removeMarkdown } from "../quizUtils";

export const QuizQuestionsOrderAnswers = ({
  answers,
  questionNumber,
}: {
  answers: OrderAnswer[];
  questionNumber: number;
}) => {
  return (
    <OakFlex
      $flexDirection={"column"}
      $gap="all-spacing-1"
      $alignItems={"start"}
      role="list"
    >
      {answers.map((item, i) => {
        const orderAnswer =
          item.answer && item.answer.length > 0 ? item.answer[0] : undefined;
        return (
          orderAnswer && (
            <OakFlex
              key={`q-${questionNumber}-answer${i}`}
              $background={"lemon50"}
              $borderRadius="border-radius-m2"
              $ph="inner-padding-xs"
              $alignItems={"flex-start"}
              $gap="all-spacing-2"
              role="listitem"
            >
              <VisuallyHidden>
                {item.correctOrder} -{" "}
                <OakCodeRenderer
                  string={removeMarkdown(orderAnswer.text)}
                  $font="code-3"
                  $mt={"space-between-none"}
                />
              </VisuallyHidden>
              <OakBox $minWidth="all-spacing-7" aria-hidden>
                <OakIcon
                  iconName={"tick"}
                  $width={"all-spacing-6"}
                  $height={"all-spacing-6"}
                />
              </OakBox>

              <OakTypography $font={["body-2-bold", "body-1-bold"]} aria-hidden>
                {item.correctOrder}
              </OakTypography>

              <OakTypography $font={["body-2", "body-1"]} aria-hidden>
                -{" "}
                <OakCodeRenderer
                  string={removeMarkdown(orderAnswer.text)}
                  $font={"code-3"}
                  $mt={"space-between-none"}
                />
              </OakTypography>
            </OakFlex>
          )
        );
      })}
    </OakFlex>
  );
};
