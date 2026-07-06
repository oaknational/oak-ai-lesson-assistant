import type { LatestQuiz } from "../../../protocol/schema";
import {
  QUIZ_MC_ANSWER_COUNT,
  QUIZ_MC_DISTRACTOR_COUNT,
  type QuizV3MultipleChoiceOnly,
  type QuizV3QuestionMultipleChoice,
} from "../../../protocol/schemas/quiz/quizV3";

/**
 * Shapes a persisted quiz for the LLM-facing multiple-choice-only schema.
 * Persisted quizzes (RAG exemplars, basedOn lessons, maths-bank quizzes) may
 * contain other question types or extra answer options; the LLM should only
 * ever see examples in the exact shape it is asked to produce.
 */
export function toMultipleChoiceOnlyQuiz(
  quiz: LatestQuiz | undefined,
): QuizV3MultipleChoiceOnly | undefined {
  if (!quiz) return undefined;
  return {
    version: "v3",
    questions: quiz.questions
      .filter(
        (q): q is QuizV3QuestionMultipleChoice =>
          q.questionType === "multiple-choice",
      )
      .map((q) => ({
        ...q,
        answers: q.answers.slice(0, QUIZ_MC_ANSWER_COUNT),
        distractors: q.distractors.slice(0, QUIZ_MC_DISTRACTOR_COUNT),
      })),
    imageMetadata: quiz.imageMetadata,
  };
}
