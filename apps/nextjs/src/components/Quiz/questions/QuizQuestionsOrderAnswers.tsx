import {
  OakBox,
  OakCodeRenderer,
  OakFlex,
  OakIcon,
  OakTypography,
} from "@oaknational/oak-components";
import { VisuallyHidden } from "@radix-ui/themes";

import type { z } from "zod";
import type { QuizV2QuestionOrderSchema } from "@oakai/aila/src/protocol/schemas/quiz/quizV2";
import { removeMarkdown, shuffleOrderItems } from "../utils";

export const QuizQuestionsOrderAnswers = ({
  items,
  questionNumber,
}: {
  items: z.infer<typeof QuizV2QuestionOrderSchema>["items"];
  questionNumber: number;
}) => {
  // Shuffle items to match student view while keeping correct order indicators
  const shuffledItems = shuffleOrderItems(items);
  
  // Create mapping to track correct order positions
  const correctOrderMap = new Map();
  items.forEach((item, correctIndex) => {
    const itemText = item.find(contentItem => contentItem.type === "text")?.text;
    if (itemText) {
      correctOrderMap.set(itemText, correctIndex + 1);
    }
  });

  return (
    <OakFlex
      $flexDirection={"column"}
      $gap="all-spacing-1"
      $alignItems={"start"}
      role="list"
    >
      {shuffledItems.map((item, i) => {
        const itemText = item.find(contentItem => contentItem.type === "text")?.text;
        const correctPosition = itemText ? correctOrderMap.get(itemText) : null;
        
        return (
          itemText && correctPosition && (
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
                Correct position {correctPosition} -{" "}
                <OakCodeRenderer
                  string={removeMarkdown(itemText)}
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
                {correctPosition}
              </OakTypography>

              <OakTypography $font={["body-2", "body-1"]} aria-hidden>
                -{" "}
                <OakCodeRenderer
                  string={removeMarkdown(itemText)}
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
