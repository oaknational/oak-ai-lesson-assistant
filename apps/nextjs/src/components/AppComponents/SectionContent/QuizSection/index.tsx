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

  if (quiz.questions.length === 0) {
    const quizBasisMap = {
      starterQuiz: "the prior knowledge for this lesson",
      exitQuiz: "the key learning points",
    };
    const quizBasis = quizType ? quizBasisMap[quizType] : "this lesson";

    return (
      <OakBox
        $pa="spacing-16"
        $background="bg-decorative1-subdued"
        $borderColor="border-decorative1-stronger"
        $borderStyle="solid"
        $borderRadius="border-radius-m"
        $ba="border-solid-m"
      >
        <OakFlex $gap="spacing-12" $alignItems="flex-start">
          <OakIcon $colorFilter="black" iconName="info" alt="" />
          <OakP $font="body-3">
            Oak doesn&apos;t have enough relevant questions based on {quizBasis}{" "}
            to generate a high-quality quiz. You can ask me to generate a quiz
            on a different topic.
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
