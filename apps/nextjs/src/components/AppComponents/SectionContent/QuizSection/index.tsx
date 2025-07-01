import { useMemo } from "react";

import type { LessonPlanSectionWhileStreaming } from "@oakai/aila/src/protocol/schema";
import { QuizV1Schema } from "@oakai/aila/src/protocol/schema";
import { convertQuizV1ToV2 } from "@oakai/aila/src/protocol/schemas/quiz/conversion/quizV1ToV2";

import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";

export type QuizSectionProps = {
  // When we have agentic generation, we will know that sections are valid when streamed
  // Until then, it's a loose type
  quizSection: LessonPlanSectionWhileStreaming;
};

export const QuizSection = ({ quizSection }: QuizSectionProps) => {
  const quiz = useMemo(() => {
    return QuizV1Schema.safeParse(quizSection).data;
  }, [quizSection]);

  if (!quiz) {
    // Shouldn't happen, but just to be safe
    return "Invalid quiz";
  }

  const quizV2 = convertQuizV1ToV2(quiz);

  return (
    <>
      {quizV2.questions.map((question, index) => {
        if (question.questionType === "multiple-choice") {
          return (
            <MultipleChoiceQuestion
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
