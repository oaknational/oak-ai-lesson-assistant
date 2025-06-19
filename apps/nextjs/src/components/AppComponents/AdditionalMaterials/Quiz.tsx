import type { StarterQuiz as StarterQuizType } from "@oakai/additional-materials/src/documents/additionalMaterials/starterQuiz/schema";

import { OakBox, OakFlex, OakP, OakSpan } from "@oaknational/oak-components";

import { toSentenceCase } from "@/utils/toSentenceCase";

type QuizProps = {
  action: string;
  generation: StarterQuizType;
  quizType: "starter" | "exit";
};

export const Quiz = ({ generation }: QuizProps) => {
  return (
    <OakFlex $gap="space-between-m" $flexDirection={"column"} $width={"100%"}>
      {generation.questions.map((question, questionIndex) => (
        <OakBox
          key={`${questionIndex}-${question.question}`}
          $mb="space-between-m"
        >
          <OakP $font="body-2">
            {questionIndex + 1}. {question.question}
          </OakP>
          <OakBox $mb="space-between-s" />

          {question.options.map((option, optionIndex) => {
            const letter = String.fromCharCode(97 + optionIndex); // a, b, c

            return (
              <OakFlex
                key={`${option.text}-${optionIndex}`}
                $alignItems="flex-start"
                $mb="space-between-s"
              >
                <OakSpan
                  $font={option.isCorrect ? "body-2-bold" : "body-2"}
                  $mr="space-between-xs"
                >
                  {letter}).
                </OakSpan>
                <OakFlex $flexDirection="column">
                  <OakP $font={option.isCorrect ? "body-2-bold" : "body-2"}>
                    {toSentenceCase(option.text)}
                    {option.isCorrect && <OakSpan> ✓</OakSpan>}
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
