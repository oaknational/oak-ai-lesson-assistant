import type { FC } from "react";
import React, { Fragment } from "react";

import { OakFlex, OakHeading } from "@oaknational/oak-components";
import type { QuizV2 } from "@oakai/aila/src/protocol/schemas";

import { QuizQuestionsListItem } from "./QuizQuestionsListItem";

export type QuizQuestionListProps = {
  quiz: QuizV2;
  isMathJaxLesson: boolean;
};

const QuestionsList: FC<QuizQuestionListProps> = (props) => {
  const { quiz, isMathJaxLesson } = props;
  const questionCount = quiz.questions.length;

  return (
    <Fragment>
      <OakHeading $font={"heading-5"} tag={"h3"}>
        {questionCount} Questions
      </OakHeading>

      <OakFlex $flexDirection={"column"} $gap={"all-spacing-10"} role="list">
        {quiz.questions.map((question, i) => {
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
