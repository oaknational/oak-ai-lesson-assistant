import type {
  ExportableQuizAppState,
  ExportableQuizQuestion,
} from "@oakai/exports/src/schema/input.schema";

import { getGenerationPartValue } from "@/ai-apps/common/state/helpers";
import { sortAlphabetically } from "@/utils/alphabetiseArray";

import type {
  QuizAppQuestion,
  QuizAppState,
  QuizAppStateQuestion,
} from "./state/types";

function stripQuizQuestionMetadata(
  quizQuestion: QuizAppStateQuestion,
): QuizAppQuestion {
  return {
    ...quizQuestion,
    question: getGenerationPartValue(quizQuestion.question),
    answers: quizQuestion.answers.map(getGenerationPartValue),
    distractors: quizQuestion.distractors.map(getGenerationPartValue),
  };
}

export function makeExportable(appState: QuizAppState): ExportableQuizAppState {
  return {
    ...appState,
    questions: appState.questions.map((questionRow) => {
      const withoutMeta = stripQuizQuestionMetadata(questionRow);
      const withAllOptions: ExportableQuizQuestion = {
        ...withoutMeta,
        allOptions: [...withoutMeta.answers, ...withoutMeta.distractors],
      };

      sortAlphabetically(withAllOptions.allOptions);

      return withAllOptions;
    }),
  };
}
