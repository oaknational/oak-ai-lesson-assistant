import { useMemo } from "react";

import type { LessonPlanSectionWhileStreaming } from "@oakai/aila/src/protocol/schema";
import { LatestQuizSchema } from "@oakai/aila/src/protocol/schema";

import { ImageAttribution } from "./ImageAttribution";
import { MatchQuestion } from "./MatchQuestion";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";
import { OrderQuestion } from "./OrderQuestion";
import { ShortAnswerQuestion } from "./ShortAnswerQuestion";

export type QuizSectionProps = {
  // When we have agentic generation, we will know that sections are valid when streamed
  // Until then, it's a loose type
  quizSection: LessonPlanSectionWhileStreaming;
  quizType?: "starterQuiz" | "exitQuiz";
};

export const QuizSection = ({ quizSection, quizType }: QuizSectionProps) => {
  const quiz = useMemo(() => {
    const result = LatestQuizSchema.safeParse(quizSection);
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
                quizType={quizType}
                questionIndex={index}
              />
            );
          case "short-answer":
            return (
              <ShortAnswerQuestion
                key={index}
                question={question}
                questionNumber={questionNumber}
                quizType={quizType}
                questionIndex={index}
              />
            );
          case "order":
            return (
              <OrderQuestion
                key={index}
                question={question}
                questionNumber={questionNumber}
                quizType={quizType}
                questionIndex={index}
              />
            );
          case "match":
            return (
              <MatchQuestion
                key={index}
                question={question}
                questionNumber={questionNumber}
                quizType={quizType}
                questionIndex={index}
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
