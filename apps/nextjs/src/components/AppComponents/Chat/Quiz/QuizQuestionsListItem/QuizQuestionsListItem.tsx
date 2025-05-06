import type { FC } from "react";
import { Fragment } from "react";

import { OakFlex } from "@oaknational/oak-components";

import { MathJaxWrap } from "../MathJaxWrap";
import { QuizQuestionsMCAnswers } from "../QuizQuestionsMCAnswers";
import { QuizQuestionsMatchAnswers } from "../QuizQuestionsMatchAnswers";
import { QuizQuestionsOrderAnswers } from "../QuizQuestionsOrderAnswers";
import { QuizQuestionsQuestionStem } from "../QuizQuestionsQuestionStem";
import { QuizQuestionsShortAnswers } from "../QuizQuestionsShortAnswers";
import type { RawQuiz } from "../quizTypes";

export type QuizQuestionsListItemProps = {
  question: NonNullable<RawQuiz>[number];
  index: number;
  isMathJaxLesson: boolean;
};

const QuizQuestionsListItem: FC<QuizQuestionsListItemProps> = (props) => {
  const { question, index, isMathJaxLesson } = props;
  const { questionStem, answers } = question;
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
          questionStem={questionStem}
          index={index}
          showIndex={question.questionType !== "explanatory-text"}
        />

        {answers && (
          <>
            {answers["multiple-choice"] &&
              answers["multiple-choice"].length > 0 && (
                <QuizQuestionsMCAnswers
                  answers={answers["multiple-choice"]}
                  questionNumber={index}
                />
              )}

            {answers["match"] && answers["match"].length > 0 && (
              <QuizQuestionsMatchAnswers
                answers={answers["match"]}
                questionNumber={index}
              />
            )}

            {answers["order"] && answers["order"].length > 0 && (
              <QuizQuestionsOrderAnswers
                answers={answers["order"]}
                questionNumber={index}
              />
            )}

            {answers["short-answer"] && answers["short-answer"].length > 0 && (
              <QuizQuestionsShortAnswers answers={answers["short-answer"]} />
            )}
          </>
        )}
      </OakFlex>
    </MathJaxWrapper>
  );
};

export default QuizQuestionsListItem;
