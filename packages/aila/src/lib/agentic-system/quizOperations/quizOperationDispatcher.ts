import type { LatestQuiz, LatestQuizQuestion } from "../../../protocol/schema";
import type { StructuralQuizIntent } from "../schema";

export type RunSingleQuestionFn = () => Promise<LatestQuizQuestion | null>;

export type QuizDispatchResult = {
  data: LatestQuiz;
  note?: string;
};

export async function quizOperationDispatcher(
  currentQuiz: LatestQuiz,
  intent: StructuralQuizIntent,
  runSingleQuestion: RunSingleQuestionFn,
): Promise<QuizDispatchResult> {
  switch (intent.action) {
    case "REMOVE_QUIZ_QUESTION":
      return handleRemove(currentQuiz, intent);
    case "ADD_QUIZ_QUESTION":
      return handleAdd(currentQuiz, intent, runSingleQuestion);
    case "CHANGE_QUIZ_QUESTION":
      return handleChange(currentQuiz, intent, runSingleQuestion);
  }
}

function handleRemove(
  currentQuiz: LatestQuiz,
  intent: StructuralQuizIntent,
): QuizDispatchResult {
  const { position } = intent;
  const { questions } = currentQuiz;

  if (position === null) {
    return {
      data: currentQuiz,
      note: "I'm not sure which question to remove — could you say 'question 3' for example?",
    };
  }

  if (position < 1 || position > questions.length) {
    return {
      data: currentQuiz,
      note: `You asked to remove question ${position}, but there are only ${questions.length} questions.`,
    };
  }

  return {
    data: {
      ...currentQuiz,
      questions: [
        ...questions.slice(0, position - 1),
        ...questions.slice(position),
      ],
    },
  };
}

async function handleAdd(
  currentQuiz: LatestQuiz,
  intent: StructuralQuizIntent,
  runSingleQuestion: RunSingleQuestionFn,
): Promise<QuizDispatchResult> {
  const { questions } = currentQuiz;
  const insertAt = intent.position ?? questions.length + 1;

  const newQuestion = await runSingleQuestion();
  if (!newQuestion) {
    return {
      data: currentQuiz,
      note: "I had trouble adding a single question. You could try 'Generate a new quiz' for a fresh set.",
    };
  }

  return {
    data: {
      ...currentQuiz,
      questions: [
        ...questions.slice(0, insertAt - 1),
        newQuestion,
        ...questions.slice(insertAt - 1),
      ],
    },
  };
}

async function handleChange(
  currentQuiz: LatestQuiz,
  intent: StructuralQuizIntent,
  runSingleQuestion: RunSingleQuestionFn,
): Promise<QuizDispatchResult> {
  const { position } = intent;
  const { questions } = currentQuiz;

  if (position === null) {
    return {
      data: currentQuiz,
      note: "I'm not sure which question to change — could you say 'question 3' for example?",
    };
  }

  if (position < 1 || position > questions.length) {
    return {
      data: currentQuiz,
      note: `You asked to change question ${position}, but there are only ${questions.length} questions.`,
    };
  }

  const replacement = await runSingleQuestion();
  if (!replacement) {
    return {
      data: currentQuiz,
      note: "I had trouble rewriting just that question. You could try 'Generate a new quiz' for a fresh set.",
    };
  }

  return {
    data: {
      ...currentQuiz,
      questions: [
        ...questions.slice(0, position - 1),
        replacement,
        ...questions.slice(position),
      ],
    },
  };
}
