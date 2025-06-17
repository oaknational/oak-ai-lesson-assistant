import React from "react";

import { OakBox, OakFlex, OakP, OakSpan } from "@oaknational/oak-components";

export type QuizQuestion = {
  question: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
};

export type QuizGeneration = {
  year?: string;
  subject?: string;
  title?: string;
  questions: QuizQuestion[];
};

type QuizProps = {
  generation: QuizGeneration;
};

export const Quiz = ({ generation }: QuizProps) => {
  return (
    <OakFlex $flexDirection={"column"} $width={"100%"}>
      <OakFlex
        $flexDirection={"column"}
        $gap={"space-between-m2"}
        $width={"100%"}
      >
        {generation.questions.map((question, questionIndex) => (
          <OakBox key={questionIndex} $mb="space-between-m">
            <OakP $font="body-2">
              {questionIndex + 1}. {question.question}
            </OakP>
            <OakBox $mt="space-between-xs" />

            {question.options.map((option, optionIndex) => {
              const letter = String.fromCharCode(97 + optionIndex); // a, b, c

              return (
                <OakFlex
                  key={optionIndex}
                  $alignItems="flex-start"
                  $mb="space-between-xs"
                  $gap={"space-between-m"}
                >
                  <OakP $font="body-2">
                    <OakSpan
                      $font={option.isCorrect ? "body-2-bold" : "body-2"}
                    >
                      {`${letter}) `}
                    </OakSpan>
                    <OakSpan
                      $font={option.isCorrect ? "body-2-bold" : "body-2"}
                    >
                      {option.text}
                    </OakSpan>
                    {option.isCorrect && <OakSpan> ✓</OakSpan>}
                  </OakP>
                </OakFlex>
              );
            })}
          </OakBox>
        ))}
      </OakFlex>
    </OakFlex>
  );
};
