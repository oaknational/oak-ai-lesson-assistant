import {
  OakBox,
  OakCodeRenderer,
  OakFlex,
  OakIcon,
  OakTypography,
} from "@oaknational/oak-components";
import type { QuizV2ContentArray } from "@oakai/aila/src/protocol/schemas";
import { VisuallyHidden } from "@radix-ui/themes";

import QuizImage from "../QuizImage";
import QuizImageAnswer from "../QuizImageAnswer";
import { shuffleMultipleChoiceAnswers } from "../utils";

export const QuizQuestionsMCAnswers = (props: {
  answers: QuizV2ContentArray[];
  distractors: QuizV2ContentArray[];
  questionNumber: number;
}) => {
  const { answers, distractors, questionNumber } = props;

  // Shuffle answers and distractors deterministically
  const shuffledChoices = shuffleMultipleChoiceAnswers(answers, distractors);
  const allChoices = shuffledChoices.map(choice => ({
    contentArray: choice.content,
    isCorrect: choice.isCorrect
  }));

  const containsImages = allChoices.some(choice =>
    choice.contentArray.some(item => item.type === "image")
  );

  return (
    <OakFlex
      $flexDirection={"column"}
      $alignItems={containsImages ? undefined : "start"}
      role="list"
    >
      {allChoices.map((choice, i) => {
        const imageItems = choice.contentArray.filter(item => item.type === "image");
        const encloseAnswer = imageItems.length > 0;
        const imageAnswer = choice.contentArray.length === 1 && imageItems.length === 1;

        return (
          <OakFlex
            key={`q-${questionNumber}-answer-${i}`}
            $flexDirection={"column"}
            $alignItems={encloseAnswer ? "center" : "flex-start"}
            $borderStyle="solid"
            $borderColor="black"
            role="listitem"
          >
            {choice.contentArray.map((contentItem, j) => {
              if (contentItem.type === "text") {
                return choice.isCorrect ? (
                  <OakFlex
                    key={`q-${questionNumber}-answer-element-${j}`}
                    $background={"lemon50"}
                    $borderRadius="border-radius-m2"
                    $ph="inner-padding-xs"
                    $alignItems={"center"}
                  >
                    <OakBox $minWidth="all-spacing-7" aria-hidden>
                      <OakIcon
                        iconName={"tick"}
                        $width={"all-spacing-6"}
                        $height={"all-spacing-6"}
                      />
                    </OakBox>
                    <VisuallyHidden>
                      Correct answer: {contentItem.text}
                    </VisuallyHidden>
                    <OakTypography $font={["body-2", "body-1"]} aria-hidden>
                      <OakCodeRenderer
                        string={contentItem.text}
                        $font="code-3"
                        $mt={"space-between-none"}
                      />
                    </OakTypography>
                  </OakFlex>
                ) : (
                  <OakCodeRenderer
                    key={`q-${questionNumber}-answer-element-${j}`}
                    string={contentItem.text}
                    $font="code-3"
                    $mt={"space-between-none"}
                  />
                );
              } else if (contentItem.type === "image") {
                return imageAnswer ? (
                  <QuizImageAnswer
                    key={`q-${questionNumber}-answer-element-${j}`}
                    src={contentItem.image}
                    answerIsCorrect={choice.isCorrect && imageAnswer}
                    alt="An image in a quiz"
                  />
                ) : (
                  <QuizImage
                    key={`q-${questionNumber}-answer-element-${j}`}
                    src={contentItem.image}
                  />
                );
              }
              return null;
            })}
          </OakFlex>
        );
      })}
    </OakFlex>
  );
};
