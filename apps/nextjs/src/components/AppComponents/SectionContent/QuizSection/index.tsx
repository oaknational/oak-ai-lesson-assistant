import { useMemo } from "react";

import type { LessonPlanSectionWhileStreaming } from "@oakai/aila/src/protocol/schema";
import { LatestQuizSchema } from "@oakai/aila/src/protocol/schema";

import { OakBox, OakFlex, OakIcon, OakP } from "@oaknational/oak-components";

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

  if (quiz.questions.length === 0 && quiz.reportId) {
    const quizLabel =
      quizType === "starterQuiz" ? "a starter quiz" : "an exit quiz";
    const reason =
      quizType === "starterQuiz"
        ? "enough relevant questions on the prior knowledge for this topic"
        : "enough relevant questions to assess the key learning points";

    return (
      <OakBox
        $pa="inner-padding-l"
        $background="bg-decorative1-subdued"
        $borderRadius="border-radius-s"
      >
        <OakFlex $gap="spacing-4" $alignItems="flex-start">
          <OakIcon $colorFilter="black" iconName="info" alt="" />
          <OakP $font="body-3">
            We weren&apos;t able to generate {quizLabel} for this lesson —
            Oak&apos;s question bank didn&apos;t have {reason}. You can ask me
            in the chat to try again with a different focus.
          </OakP>
        </OakFlex>
      </OakBox>
    );
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
