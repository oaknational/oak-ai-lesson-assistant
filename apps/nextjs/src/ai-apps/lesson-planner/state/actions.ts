import type { RateLimitInfo } from "@oakai/api/src/types";
import type { KeyStageName, SubjectName } from "@oakai/core";
import type {
  QuizAppQuestion,
  QuizAppStateQuestion,
} from "ai-apps/quiz-designer/state/types";

import type { DeepPartial } from "@/utils/types/DeepPartial";

import type {
  LPKeyLearningPoint,
  LPKeyword,
  LPMisconception,
  LessonPlanSections,
  LessonPlannerAppState,
} from "./types";

/**
 * Our action types are declared as a const enum with string values
 * for debugging purposes, otherwise all TS transpiles them to integers
 * which isn't very useful
 */

enum LessonPlannerAppActions {
  AddKeyLearningPoint = "ADD_KEY_LEARNING_POINT",
  AddKeyword = "ADD_KEYWORD",
  AddMisconception = "ADD_MISCONCEPTION",
  BackToEditSubjectAndKS = "BACK_TO_EDIT_SUBJ_KS",
  Begin = "BEGIN",
  CreateSession = "CREATE_SESSION",
  EncounteredNonRecoverableError = "ENCOUNTERED_NON_RECOVERABLE_ERROR",
  ExtendedQuiz = "EXTENDED_QUIZ",
  GeneratedLessonPlan = "GENERATED_LESSON_PLAN",
  RegeneratedKeyLearningPoints = "REGENERATED_KEY_LEARNING_POINTS",
  RegeneratedKeywords = "REGENERATED_KEYWORDS",
  RegeneratedMisconceptions = "REGENERATED_MISCONCEPTIONS",
  RemoveKeyLearningPoint = "REMOVE_KEY_LEARNING_POINT",
  RemoveKeyword = "REMOVE_KEYWORD",
  RemoveMisconception = "REMOVE_MISCONCEPTION",
  RequestReset = "REQUEST_RESET",
  RestoreExitQuizFromLocalStorage = "RESTORE_EXIT_QUIZ_FROM_LOCAL_STORAGE",
  RestoreSession = "RESTORE_SESSION",
  RestoreStarterQuizFromLocalStorage = "RESTORE_STARTER_QUIZ_FROM_LOCAL_STORAGE",
  SetKeyStage = "SET_KEY_STAGE",
  SetLessonTitle = "SET_LESSON_TITLE",
  SetSubject = "SET_SUBJECT",
  SetTopic = "SET_TOPIC",
  TweakedKeyLearningPoint = "TWEAK_KEY_LEARNING_POINT",
  TweakedKeyLearningPoints = "TWEAK_KEY_LEARNING_POINTS",
  TweakedKeyword = "TWEAK_KEYWORD",
  TweakedMisconception = "TWEAK_MISCONCEPTION",
  UpdateGenerationRateLimit = "UPDATE_GENERATION_RATE_LIMIT",
  UpdatePartialLessonPlan = "UPDATE_PARTIAL_LESSON_PLAN",
}

export type LessonPlannerAppAction =
  | { type: LessonPlannerAppActions.CreateSession; sessionId: string }
  | { type: LessonPlannerAppActions.Begin }
  | { type: LessonPlannerAppActions.BackToEditSubjectAndKS }
  | { type: LessonPlannerAppActions.SetTopic; topic: string }
  | { type: LessonPlannerAppActions.SetKeyStage; keyStage: KeyStageName }
  | { type: LessonPlannerAppActions.SetSubject; subject: SubjectName }
  | { type: LessonPlannerAppActions.SetLessonTitle; lessonTitle: string }
  | {
      type: LessonPlannerAppActions.UpdateGenerationRateLimit;
      rateLimit: RateLimitInfo;
    }
  | {
      type: LessonPlannerAppActions.AddKeyword;
    }
  | {
      type: LessonPlannerAppActions.RemoveKeyword;
    }
  | {
      type: LessonPlannerAppActions.TweakedKeyword;
      keyword?: string;
      keywordDescription?: string;
      index: number;
    }
  | {
      type: LessonPlannerAppActions.TweakedMisconception;
      misconception?: string;
      misconceptionsDescription?: string;
      index: number;
    }
  | {
      type: LessonPlannerAppActions.RemoveMisconception;
    }
  | {
      type: LessonPlannerAppActions.AddMisconception;
    }
  | {
      type: LessonPlannerAppActions.TweakedKeyLearningPoint;
      newValue: string;
      index: number;
    }
  | {
      type: LessonPlannerAppActions.AddKeyLearningPoint;
    }
  | {
      type: LessonPlannerAppActions.RemoveKeyLearningPoint;
    }
  | {
      type: LessonPlannerAppActions.UpdatePartialLessonPlan;
      lastGenerationId: string;
      sections: DeepPartial<LessonPlanSections>;
    }
  | {
      type: LessonPlannerAppActions.GeneratedLessonPlan;
      lastGenerationId: string;
      sections: LessonPlanSections;
    }
  | {
      type: LessonPlannerAppActions.RegeneratedKeyLearningPoints;
      lastGenerationId: string;
      keyLearningPoints: LPKeyLearningPoint[];
    }
  | {
      type: LessonPlannerAppActions.RegeneratedMisconceptions;
      lastGenerationId: string;
      misconceptions: LPMisconception[];
    }
  | {
      type: LessonPlannerAppActions.RegeneratedKeywords;
      lastGenerationId: string;
      keywords: LPKeyword[];
    }
  | {
      type: LessonPlannerAppActions.ExtendedQuiz;
      lastGenerationId: string;
      quizType: "starterQuiz" | "exitQuiz";
      quiz: QuizAppQuestion[];
    }
  | {
      type: LessonPlannerAppActions.RestoreStarterQuizFromLocalStorage;
      lessonPlannerStarterQuizState: QuizAppStateQuestion[];
    }
  | {
      type: LessonPlannerAppActions.RestoreExitQuizFromLocalStorage;
      lessonPlannerExitQuizState: QuizAppStateQuestion[];
    }
  | {
      type: LessonPlannerAppActions.RestoreSession;
      session: LessonPlannerAppState;
    }
  | {
      type: LessonPlannerAppActions.RequestReset;
    }
  | {
      type: LessonPlannerAppActions.EncounteredNonRecoverableError;
    }
  | {
      type: LessonPlannerAppActions.TweakedKeyLearningPoints;
      newValue: string;
      index: number;
    };
