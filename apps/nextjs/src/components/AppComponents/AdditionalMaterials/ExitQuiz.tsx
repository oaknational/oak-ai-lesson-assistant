import React from "react";

import type { ExitQuiz as ExitQuizType } from "@oakai/additional-materials/src/documents/additionalMaterials/exitQuiz/schema";

import { OakBox, OakFlex, OakP, OakSpan } from "@oaknational/oak-components";

type ExitQuizProps = {
  action: string;
  generation: ExitQuizType;
};

export const ExitQuiz = ({ action, generation }: ExitQuizProps) => {
  return (
    <OakFlex $flexDirection={"column"} $width={"100%"}>
      <OakP $font="heading-6">Exit Quiz</OakP>
      <OakP $mb="space-between-s">
        {generation.year} • {generation.subject} • {generation.title}
      </OakP>

      {generation.questions.map((question, questionIndex) => (
        <OakBox key={questionIndex} $mb="space-between-m">
          <OakP $font="heading-7">
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
              >
                <OakSpan $font="body-3-bold" $mr="space-between-xs">
                  {letter}.
                </OakSpan>
                <OakFlex $flexDirection="column">
                  <OakP $font="body-3">
                    {option.text}
                    {option.isCorrect && <OakSpan $color="mint"> ✓</OakSpan>}
                  </OakP>
                </OakFlex>
              </OakFlex>
            );
          })}
        </OakBox>
      ))}
    </OakFlex>
  );
};
