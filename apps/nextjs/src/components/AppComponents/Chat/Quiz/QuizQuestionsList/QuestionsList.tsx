import type { FC } from "react";
import React, { Fragment } from "react";

import { OakFlex, OakHeading } from "@oaknational/oak-components";

import QuizQuestionsListItem from "../QuizQuestionsListItem";
import type { QuizProps } from "../quizTypes";

export type QuizQuestionListProps = QuizProps & { isMathJaxLesson: boolean };

const QuestionsList: FC<QuizQuestionListProps> = (props) => {
  const { questions, isMathJaxLesson } = props;
  const questionCount = questions.length;

  return (
    <Fragment>
      <OakHeading $font={"heading-5"} tag={"h3"}>
        {questionCount} Questions
      </OakHeading>

      <OakFlex $flexDirection={"column"} $gap={"all-spacing-10"} role="list">
        {questions.map((question, i) => {
          return (
            <QuizQuestionsListItem
              key={`QuestionsList-UL-QuestionListItem-${i}`}
              question={question}
              index={i}
              isMathJaxLesson={isMathJaxLesson}
            />
          );
        })}
      </OakFlex>
    </Fragment>
  );
};

export default QuestionsList;
