"use client";

import type { FC } from "react";
import { useMemo } from "react";

import {
  OakBox,
  OakFlex,
  OakHeading,
  OakSpan,
} from "@oaknational/oak-components";
import type { QuizV2 } from "@oakai/aila/src/protocol/schemas";

import { OakMathJaxContext } from "@/components/MathJax";

import QuizQuestionsList from "../QuizQuestionsList";
import { extractImageAttributions } from "../utils";

export type QuizProps = {
  quiz: QuizV2;
  isMathJaxLesson: boolean;
};

export const LessonOverviewQuizContainer: FC<QuizProps> = (props) => {
  const imageAttributions = useMemo(() => 
    extractImageAttributions(props.quiz), [props.quiz]
  );

  return props.quiz.questions.length > 0 ? (
    <OakMathJaxContext>
      <OakHeading $font={"heading-4"} tag={"h2"}>
        Starter quiz
      </OakHeading>
      <OakFlex
        $flexDirection={"column"}
        $justifyContent={"center"}
        $width={"100%"}
        $position={"relative"}
      >
        <QuizQuestionsList {...props} />
      </OakFlex>
      {imageAttributions.length > 0 && (
        <OakBox $mt="space-between-m">
          {imageAttributions.map(({ attribution, questionNumber }) => (
            <OakSpan key={`image-attr-${attribution}-${questionNumber}`}>
              <OakSpan $font={"body-3-bold"}>{`${questionNumber} `}</OakSpan>
              <OakSpan $font={"body-3"}>{`${attribution} `}</OakSpan>
            </OakSpan>
          ))}
        </OakBox>
      )}
    </OakMathJaxContext>
  ) : null;
};

