import React from "react";

import type { StarterQuiz as StarterQuizType } from "@oakai/additional-materials/src/documents/additionalMaterials/starterQuiz/schema";

import { OakBox, OakFlex, OakP, OakSpan } from "@oaknational/oak-components";

import { toSentenceCase } from "@/utils/toSentenceCase";

type QuizProps = {
  action: string;
  generation: StarterQuizType;
  quizType: "starter" | "exit";
};

export const Quiz = ({ action, generation, quizType }: QuizProps) => {
  return (
    <OakFlex $flexDirection={"column"} $width={"100%"}>
      <OakP $font="heading-6">
        {quizType === "starter" ? "Starter Quiz" : "Exit Quiz"}
      </OakP>
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
                    {toSentenceCase(option.text)}
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
