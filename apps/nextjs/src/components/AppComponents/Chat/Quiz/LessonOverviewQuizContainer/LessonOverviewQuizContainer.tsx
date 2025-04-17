import type { FC } from "react";

import { OakBox, OakFlex, OakSpan } from "@oaknational/oak-components";
import { MathJaxContext } from "better-react-mathjax";

import QuizQuestionsList from "../QuizQuestionsList";
import type { RawQuiz } from "../quizTypes";

export type QuizProps = {
  questions: NonNullable<RawQuiz>;
  imageAttribution: { attribution: string; questionNumber: string }[];
  isMathJaxLesson: boolean;
};

const LessonOverviewQuizContainer: FC<QuizProps> = (props) => {
  return props.questions && props.questions.length > 0 ? (
    <MathJaxContext>
      <OakFlex
        $flexDirection={"column"}
        $justifyContent={"center"}
        $width={"100%"}
        $position={"relative"}
        $ba={"border-solid-m"}
      >
        <QuizQuestionsList {...props} />
      </OakFlex>
      {props.imageAttribution.length > 0 && (
        <OakBox $mt="space-between-m">
          {props.imageAttribution.map(({ attribution, questionNumber }) => (
            <OakSpan key={`image-attr-${attribution}-${questionNumber}`}>
              <OakSpan $font={"body-3-bold"}>{`${questionNumber} `}</OakSpan>
              <OakSpan $font={"body-3"}>{`${attribution} `}</OakSpan>
            </OakSpan>
          ))}
        </OakBox>
      )}
    </MathJaxContext>
  ) : null;
};

export default LessonOverviewQuizContainer;
