import { useMemo } from "react";

import type {
  LessonPlanSectionWhileStreaming,
  QuizV2,
} from "@oakai/aila/src/protocol/schema";
import { QuizV2Schema } from "@oakai/aila/src/protocol/schema";

import { MatchQuestion } from "./MatchQuestion";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";

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
        if (question.questionType === "multiple-choice") {
          return (
            <MultipleChoiceQuestion
              key={index}
              question={question}
              questionNumber={index + 1}
            />
          );
        }
        if (question.questionType === "match") {
          return (
            <MatchQuestion
              key={index}
              question={question}
              questionNumber={index + 1}
            />
          );
        }
        return null;
      })}
    </>
  );
};
