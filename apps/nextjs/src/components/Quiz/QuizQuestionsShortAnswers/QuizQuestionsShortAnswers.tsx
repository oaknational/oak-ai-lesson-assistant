import {
  OakBox,
  OakCodeRenderer,
  OakFlex,
  OakIcon,
  OakTypography,
} from "@oaknational/oak-components";
import { VisuallyHidden } from "@radix-ui/themes";

import type { QuizV2ContentArray } from "@oakai/aila/src/protocol/schemas";
import { removeMarkdown } from "../quizUtils";

export const QuizQuestionsShortAnswers = ({
  answers,
}: {
  answers: QuizV2ContentArray[];
}) => {
  const answerString = answers.reduce((acc, cur) => {
    const textItem = cur.find(item => item.type === "text");
    const text = textItem?.text;
    if (acc === "") {
      return text ?? acc;
    }

    return text ? `${acc}, ${text}` : acc;
  }, "");

  return (
    <OakFlex
      $flexDirection={"column"}
      $gap="all-spacing-1"
      $alignItems={"start"}
    >
      <OakFlex
        $background={"lemon50"}
        $borderRadius="border-radius-m2"
        $ph="inner-padding-xs"
        $alignItems={"center"}
        $gap="all-spacing-2"
      >
        <VisuallyHidden>
          Correct Answer: {removeMarkdown(answerString)}
        </VisuallyHidden>

        <OakBox $minWidth="all-spacing-7" aria-hidden>
          <OakIcon
            iconName={"tick"}
            $width={"all-spacing-6"}
            $height={"all-spacing-6"}
          />
        </OakBox>

        <OakTypography $font={["body-2", "body-1"]} aria-hidden>
          <OakCodeRenderer
            string={removeMarkdown(answerString)}
            $font="code-3"
            $mt={"space-between-none"}
          />
        </OakTypography>
      </OakFlex>
    </OakFlex>
  );
};
