import type { StarterQuiz as StarterQuizType } from "@oakai/teaching-materials/src/documents/teachingMaterials/starterQuiz/schema";

import { OakBox, OakFlex, OakP, OakSpan } from "@oaknational/oak-components";

import { MathJaxWrap } from "@/components/MathJax";

type QuizProps = {
  action: string;
  generation: StarterQuizType;
};

export const Quiz = ({ generation }: QuizProps) => {
  return (
    <MathJaxWrap>
      <OakFlex $gap="spacing-24" $flexDirection={"column"} $width={"100%"}>
        {generation.questions.map((question, questionIndex) => (
          <OakBox
            key={`${questionIndex}-${question.question}`}
            $mb="spacing-24"
          >
            <OakP $font="body-2">
              {questionIndex + 1}. {question.question}
            </OakP>
            <OakBox $mb="spacing-16" />

            {question.options.map((option, optionIndex) => {
              const letter = String.fromCharCode(97 + optionIndex); // a, b, c

              return (
                <OakFlex
                  key={`${option.text}-${optionIndex}`}
                  $alignItems="flex-start"
                  $mb="spacing-16"
                >
                  <OakSpan
                    $font={option.isCorrect ? "body-2-bold" : "body-2"}
                    $mr="spacing-12"
                  >
                    {letter})
                  </OakSpan>
                  <OakFlex $flexDirection="column">
                    <OakP $font={option.isCorrect ? "body-2-bold" : "body-2"}>
                      {option.text}
                      {option.isCorrect && <OakSpan> ✓</OakSpan>}
                    </OakP>
                  </OakFlex>
                </OakFlex>
              );
            })}
          </OakBox>
        ))}
      </OakFlex>
    </MathJaxWrap>
  );
};
