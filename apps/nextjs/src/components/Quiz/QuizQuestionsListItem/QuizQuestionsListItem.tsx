import type { FC } from "react";
import { Fragment } from "react";

import { OakFlex } from "@oaknational/oak-components";
import type { QuizV2Question } from "@oakai/aila/src/protocol/schemas";

import { MathJaxWrap } from "@/components/MathJax";

import { QuizQuestionsMCAnswers } from "../questions/QuizQuestionsMCAnswers";
import { QuizQuestionsMatchAnswers } from "../questions/QuizQuestionsMatchAnswers";
import { QuizQuestionsOrderAnswers } from "../questions/QuizQuestionsOrderAnswers";
import { QuizQuestionsQuestionStem } from "../questions/QuizQuestionsQuestionStem";
import { QuizQuestionsShortAnswers } from "../questions/QuizQuestionsShortAnswers";

export type QuizQuestionsListItemProps = {
  question: QuizV2Question;
  index: number;
  isMathJaxLesson: boolean;
};

export const QuizQuestionsListItem: FC<QuizQuestionsListItemProps> = (props) => {
  const { question, index, isMathJaxLesson } = props;
  const MathJaxWrapper = isMathJaxLesson ? MathJaxWrap : Fragment;

  return (
    <MathJaxWrapper>
      <OakFlex
        $flexDirection={"column"}
        $width={"100%"}
        role="listitem"
        $gap={"all-spacing-2"}
      >
        <QuizQuestionsQuestionStem
          questionStem={question.questionStem}
          index={index}
          showIndex={question.questionType !== "explanatory-text"}
        />

        {/* Render answers based on question type */}
        {question.questionType === "multiple-choice" && (
          <QuizQuestionsMCAnswers
            answers={question.answers}
            distractors={question.distractors}
            questionNumber={index}
          />
        )}

        {question.questionType === "match" && (
          <QuizQuestionsMatchAnswers
            pairs={question.pairs}
            questionNumber={index}
          />
        )}

        {question.questionType === "order" && (
          <QuizQuestionsOrderAnswers
            items={question.items}
            questionNumber={index}
          />
        )}

        {question.questionType === "short-answer" && (
          <QuizQuestionsShortAnswers answers={question.answers} />
        )}

        {/* Note: explanatory-text questions only show the question stem */}
      </OakFlex>
    </MathJaxWrapper>
  );
};
