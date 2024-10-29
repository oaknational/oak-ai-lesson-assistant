import type { RateLimitInfo } from "@oakai/api/src/types";
import type { KeyStageName, SubjectName } from "@oakai/core";
import type { PotentialQuestionsType } from "hooks/useSuggestedQuestions";

import type { QuizAppState, QuizQuestionType } from "./types";

/**
 * Our action types are declared as a const enum with string values
 * for debugging purposes, otherwise all TS transpiles them to integers
 * which isn't very useful
 */
export const enum QuizAppActions {
  CreateSession = "CREATE_SESSION",
  RestoreSession = "RESTORE_SESSION",
  ResetSession = "RESET_SESSION",
  RequestReset = "REQUEST_RESET",
  Begin = "BEGIN",
  BackToEditSubjectAndKS = "BACK_TO_EDIT_SUBJ_KS",
  SetKeyStage = "SET_KEY_STAGE",
  SetSubject = "SET_SUBJECT",
  SetTopic = "SET_TOPIC",
  BackToEditQuestions = "BACK_TO_EDIT_QUESTIONS",
  AddQuestion = "ADD_QUESTION",
  DeleteQuestion = "DELETE_QUESTION",
  UpdateQuestionText = "UPDATE_QUESTION_TEXT",
  UpdateQuestionType = "UPDATE_QUESTION_TYPE",
  UpdateNumberOfCorrectAnswers = "UPDATE_NUMBER_OF_CORRECT_ANSWERS",
  GeneratedAnswerAndDistractors = "GENERATED_ANSWER_AND_DISTRACTORS",
  RegeneratedAnswerAndDistractors = "REGENERATED_ANSWER_AND_DISTRACTORS",
  RegeneratedAnswers = "REGENERATED_ANSWERS",
  TweakedAnswer = "TWEAKED_ANSWER",
  RegeneratedDistractor = "REGENERATED_DISTRACTOR",
  RegeneratedAllDistractors = "REGENERATED_ALL_DISTRACTORS",
  TweakedDistractor = "TWEAKED_DISTRACTOR",
  UpdateGenerationRateLimit = "UPDATE_GENERATION_RATE_LIMIT",
  EncounteredNonRecoverableError = "ENCOUNTERED_NON_RECOVERABLE_ERROR",
  AddPopulatedQuestion = "ADD_POPULATED_QUESTION",
}

export type QuizAppAction =
  | {
      type: QuizAppActions.RestoreSession;
      session: QuizAppState;
    }
  | { type: QuizAppActions.ResetSession; sessionId: string }
  | { type: QuizAppActions.RequestReset }
  | { type: QuizAppActions.CreateSession; sessionId: string }
  | { type: QuizAppActions.Begin }
  | { type: QuizAppActions.BackToEditSubjectAndKS }
  | { type: QuizAppActions.SetTopic; topic: string }
  | { type: QuizAppActions.SetKeyStage; keyStage: KeyStageName }
  | { type: QuizAppActions.SetSubject; subject: SubjectName }
  | { type: QuizAppActions.BackToEditQuestions }
  | { type: QuizAppActions.AddQuestion }
  | { type: QuizAppActions.DeleteQuestion; questionIdx: number }
  | {
      type: QuizAppActions.AddPopulatedQuestion;
      question: PotentialQuestionsType[0];
    }
  | {
      type: QuizAppActions.UpdateQuestionText;
      questionText: string;
      questionIdx: number;
    }
  | {
      type: QuizAppActions.UpdateQuestionType;
      questionType: QuizQuestionType;
      questionIdx: number;
    }
  | {
      type: QuizAppActions.UpdateNumberOfCorrectAnswers;
      numberOfAnswers: number;
      questionIdx: number;
    }
  | {
      type: QuizAppActions.GeneratedAnswerAndDistractors;
      questionIdx: number;
      generationId: string;
      answers: string[];
      distractors: string[];
    }
  | {
      type: QuizAppActions.RegeneratedAnswerAndDistractors;
      questionIdx: number;
      generationId: string;
      answers: string[];
      distractors: string[];
    }
  | {
      type: QuizAppActions.RegeneratedAnswers;
      questionIdx: number;
      generationId: string;
      answers: string[];
    }
  | {
      type: QuizAppActions.TweakedAnswer;
      questionIdx: number;
      tweakedAnswer: string;
      answerIdx: number;
    }
  | {
      type: QuizAppActions.RegeneratedDistractor;
      questionIdx: number;
      distractorIdx: number;
      generationId: string;
      distractor: string;
    }
  | {
      type: QuizAppActions.RegeneratedAllDistractors;
      questionIdx: number;
      generationId: string;
      distractors: string[];
    }
  | {
      type: QuizAppActions.TweakedDistractor;
      questionIdx: number;
      tweakedDistractor: string;
      distractorIdx: number;
    }
  | {
      type: QuizAppActions.UpdateGenerationRateLimit;
      rateLimit: RateLimitInfo;
    }
  | {
      type: QuizAppActions.EncounteredNonRecoverableError;
    };
