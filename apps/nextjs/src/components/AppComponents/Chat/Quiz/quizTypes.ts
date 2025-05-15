// Import all types and schemas from the central file
import type {
  ConvertKeysToCamelCase,
  ImageItem,
  ImageOrTextItem,
  MCAnswer,
  MatchAnswer,
  OrderAnswer,
  QuizProps,
  QuizQuestion,
  QuizQuestionAnswers,
  RawQuiz,
  ShortAnswer,
  StemImageObject,
  StemObject,
  StemTextObject,
  TextItem,
} from "@oakai/aila/src/protocol/rawQuizSchema";
import {
  rawQuizQuestionSchema,
  rawQuizSchema,
} from "@oakai/aila/src/protocol/rawQuizSchema";

// Re-export everything
export type {
  ConvertKeysToCamelCase,
  ImageItem,
  ImageOrTextItem,
  MatchAnswer,
  MCAnswer,
  OrderAnswer,
  QuizProps,
  QuizQuestion,
  QuizQuestionAnswers,
  RawQuiz,
  ShortAnswer,
  StemImageObject,
  StemObject,
  StemTextObject,
  TextItem,
};

export { rawQuizQuestionSchema, rawQuizSchema };
