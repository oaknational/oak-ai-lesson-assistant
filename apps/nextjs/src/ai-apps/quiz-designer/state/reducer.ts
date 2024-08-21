import { GenerationPartType } from "@oakai/core/src/types";
import logger from "@oakai/logger/browser";
import {
  createAIGeneratedPart,
  createTweakPart,
} from "ai-apps/common/state/create-parts";
import { removeAtIndex, updateAtIndex } from "ai-apps/common/state/helpers";
import { PotentialQuestionsType } from "hooks/useSuggestedQuestions";

import { QuizAppAction, QuizAppActions } from "./actions";
import {
  QuizAppState,
  QuizAppStateQuestion,
  QuizAppStatus,
  QuizQuestionType,
} from "./types";

export function quizAppReducer(
  state: QuizAppState,
  action: QuizAppAction,
): QuizAppState {
  logger.debug({ state, action }, "quizAppReducer %s", action.type);

  switch (action.type) {
    case QuizAppActions.CreateSession:
      return {
        ...state,
        status: QuizAppStatus.EditingSubjectAndKS,
        sessionId: action.sessionId,
      };
    case QuizAppActions.RestoreSession:
      return action.session;
    case QuizAppActions.ResetSession:
      return {
        ...state,
        status: QuizAppStatus.EditingSubjectAndKS,
        sessionId: action.sessionId,
        keyStage: "",
        subject: "",
        topic: "",
        questions: [],
        rateLimit: null,
      };
    case QuizAppActions.RequestReset:
      return {
        ...state,
        status: QuizAppStatus.ResettingQuiz,
      };
    case QuizAppActions.Begin:
      return {
        ...state,
        status: QuizAppStatus.EditingQuestions,
        questions: [createQuestion()],
      };
    case QuizAppActions.SetTopic:
      return {
        ...state,
        topic: action.topic,
      };
    case QuizAppActions.SetKeyStage:
      return {
        ...state,
        keyStage: action.keyStage,
      };
    case QuizAppActions.SetSubject:
      return {
        ...state,
        subject: action.subject,
      };
    case QuizAppActions.BackToEditSubjectAndKS:
      return {
        ...state,
        status: QuizAppStatus.EditingSubjectAndKS,
      };
    case QuizAppActions.BackToEditQuestions:
      return {
        ...state,
        status: QuizAppStatus.EditingQuestions,
      };
    case QuizAppActions.AddQuestion:
      return {
        ...state,
        questions: [...state.questions, createQuestion()],
      };
    case QuizAppActions.DeleteQuestion:
      return {
        ...state,
        questions: removeAtIndex(action.questionIdx, state.questions),
      };
    case QuizAppActions.UpdateQuestionText:
      return updateQuestionAtIndex(
        state,
        action.questionIdx,
        (questionToUpdate) => ({
          ...questionToUpdate,
          question: {
            ...questionToUpdate.question,
            value: action.questionText,
          },
        }),
      );

    case QuizAppActions.UpdateQuestionType:
      return updateQuestionAtIndex(
        state,
        action.questionIdx,
        (questionToUpdate) => ({
          ...questionToUpdate,
          questionType: action.questionType,
        }),
      );
    case QuizAppActions.UpdateNumberOfCorrectAnswers:
      return updateQuestionAtIndex(
        state,
        action.questionIdx,
        (questionToUpdate) => ({
          ...questionToUpdate,
          numberOfAnswers: action.numberOfAnswers,
        }),
      );
    case QuizAppActions.GeneratedAnswerAndDistractors:
    case QuizAppActions.RegeneratedAnswerAndDistractors:
      return updateQuestionAtIndex(
        state,
        action.questionIdx,
        (questionToUpdate) => ({
          ...questionToUpdate,
          answers: action.answers.map((answer) =>
            createAIGeneratedPart(answer, action.generationId),
          ),
          distractors: action.distractors.map((distractor) =>
            createAIGeneratedPart(distractor, action.generationId),
          ),
        }),
      );
    case QuizAppActions.RegeneratedAnswers:
      return updateQuestionAtIndex(
        state,
        action.questionIdx,
        (questionToUpdate) => ({
          ...questionToUpdate,
          answers: action.answers.map((answer) =>
            createAIGeneratedPart(answer, action.generationId),
          ),
        }),
      );
    case QuizAppActions.TweakedAnswer:
      return updateQuestionAtIndex(
        state,
        action.questionIdx,
        (questionToUpdate) => ({
          ...questionToUpdate,
          answers: updateAtIndex(
            questionToUpdate.answers,
            action.answerIdx,
            (answer) => createTweakPart(action.tweakedAnswer, answer),
          ),
        }),
      );
    case QuizAppActions.RegeneratedDistractor:
      return updateQuestionAtIndex(
        state,
        action.questionIdx,
        (questionToUpdate) => ({
          ...questionToUpdate,
          distractors: updateAtIndex(
            questionToUpdate.distractors,
            action.distractorIdx,
            () => createAIGeneratedPart(action.distractor, action.generationId),
          ),
        }),
      );

    case QuizAppActions.RegeneratedAllDistractors:
      return updateQuestionAtIndex(
        state,
        action.questionIdx,
        (questionToUpdate) => ({
          ...questionToUpdate,
          distractors: action.distractors.map((answer) =>
            createAIGeneratedPart(answer, action.generationId),
          ),
        }),
      );
    case QuizAppActions.TweakedDistractor:
      return updateQuestionAtIndex(
        state,
        action.questionIdx,
        (questionToUpdate) => ({
          ...questionToUpdate,
          distractors: updateAtIndex(
            questionToUpdate.distractors,
            action.distractorIdx,
            (distractor) =>
              createTweakPart(action.tweakedDistractor, distractor),
          ),
        }),
      );
    case QuizAppActions.UpdateGenerationRateLimit:
      return {
        ...state,
        rateLimit: action.rateLimit,
      };
    case QuizAppActions.EncounteredNonRecoverableError:
      return {
        ...state,
        status: QuizAppStatus.NonRecoverableError,
      };
    case QuizAppActions.AddPopulatedQuestion:
      return {
        ...state,
        questions: [...state.questions, addPopulatedQuestion(action.question)],
      };
    default:
      // @ts-expect-error action.type should be `never`, otherwise we have an
      // unhandled case
      throw Error(`Unhandled action type ${action.type}`);
  }
}

function updateQuestionAtIndex(
  state: QuizAppState,
  questionIdx: number,
  updater: (question: QuizAppStateQuestion) => QuizAppStateQuestion,
): QuizAppState {
  return {
    ...state,
    questions: state.questions.map((question, i) =>
      i === questionIdx ? updater(question) : question,
    ),
  };
}

function addPopulatedQuestion(question: PotentialQuestionsType[0]) {
  return {
    question: createAIGeneratedPart(question.question, "initial"),
    answers: question.answers.map((answer) =>
      createAIGeneratedPart(answer, "initial"),
    ),
    distractors: question.distractors.map((distractor) =>
      createAIGeneratedPart(distractor, "initial"),
    ),
    questionType: QuizQuestionType.MultipleChoice,
    numberOfAnswers: 1,
  };
}

/**
 * Helper to scaffold an empty initial question
 */
function createQuestion(): QuizAppStateQuestion {
  return {
    question: {
      type: GenerationPartType.UserGenerated,
      value: "",
      lastGenerationId: null,
    },
    questionType: QuizQuestionType.MultipleChoice,
    numberOfAnswers: 1,
    answers: [],
    distractors: [],
  };
}
