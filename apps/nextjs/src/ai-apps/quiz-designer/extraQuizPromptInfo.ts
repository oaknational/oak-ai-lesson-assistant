import type { QuizAppState, QuizAppStateQuestion } from "./state/types";

type OtherQuestionForPromptProps = {
  state: QuizAppState;
  questionRow?: QuizAppStateQuestion;
};

export const extraQuizPromptInfo = ({
  state,
  questionRow,
}: OtherQuestionForPromptProps) => {
  const topic = state.topic;
  const otherQuestions = state.questions
    .filter((q) => q.question.value !== questionRow?.question.value)
    .map(
      (q) =>
        `* Question: "${q.question.value}" / Correct: ${q.answers
          .map((a) => a.value)
          .join(", ")} / Distractors: ${q.distractors
          .map((d) => d.value)
          .join(", ")}`,
    )
    .join("\n");

  const extraContext = `${topic} : ${questionRow?.question.value}. Other questions include: ${otherQuestions}`;

  return {
    otherQuestions,
    extraContext,
  };
};
