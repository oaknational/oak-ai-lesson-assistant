import { useMemo } from "react";

import type { LessonPlanSectionWhileStreaming } from "@oakai/aila/src/protocol/schema";
import { QuizV2Schema } from "@oakai/aila/src/protocol/schema";

import { ImageAttribution } from "./ImageAttribution";
import { MatchQuestion } from "./MatchQuestion";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";
import { OrderQuestion } from "./OrderQuestion";
import { ShortAnswerQuestion } from "./ShortAnswerQuestion";

export type QuizSectionProps = {
  // When we have agentic generation, we will know that sections are valid when streamed
  // Until then, it's a loose type
  quizSection: LessonPlanSectionWhileStreaming;
};

export const QuizSection = ({ quizSection }: QuizSectionProps) => {
  const quiz = useMemo(() => {
    const result = QuizV2Schema.safeParse(quizSection);
    return result.success ? result.data : null;
  }, [quizSection]);

  if (!quiz) {
    // Shouldn't happen, but just to be safe
    return "Invalid quiz";
  }

  return (
    <>
      {quiz.questions.map((question, index) => {
        const questionNumber = index + 1;

        switch (question.questionType) {
          case "multiple-choice":
            return (
              <MultipleChoiceQuestion
                key={index}
                question={question}
                questionNumber={questionNumber}
              />
            );
          case "short-answer":
            return (
              <ShortAnswerQuestion
                key={index}
                question={question}
                questionNumber={questionNumber}
              />
            );
          case "order":
            return (
              <OrderQuestion
                key={index}
                question={question}
                questionNumber={questionNumber}
              />
            );
          case "match":
            return (
              <MatchQuestion
                key={index}
                question={question}
                questionNumber={questionNumber}
              />
            );
          default:
            return null;
        }
      })}
      <ImageAttribution quiz={quiz} />
    </>
  );
};
