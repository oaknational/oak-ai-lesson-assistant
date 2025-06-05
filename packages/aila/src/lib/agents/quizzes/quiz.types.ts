/**
 * A complete quiz composed of discriminated-question variants.
 */
export type QuizFull = QuizQuestion[];

/**
 * All supported question types.
 */
export type QuestionType =
  | "multiple-choice"
  | "match"
  | "order"
  | "short-answer"
  | "explanatory-text";

/**
 * Shared base for every question.
 */
interface BaseQuestion {
  /** Unique numeric ID */
  id: number;
  /** Unique string UID */
  uid: string;
  /** Content of the question (text and images) */
  stem: StemItem[];
  /** Feedback after answering */
  feedback: StemItem[];
  /** Hint to aid the learner */
  hint: StemItem[];
  /** Whether the question is active */
  active: boolean;
}

/**
 * Union of all question variants, discriminated by `type`.
 */
export type QuizQuestion =
  | MultipleChoiceQuestion
  | MatchQuestion
  | OrderQuestion
  | ShortAnswerQuestion
  | ExplanatoryTextQuestion;

/**
 * Multiple-choice question.
 */
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multipleChoice";
  answers: MultipleChoiceAnswers;
}

/**
 * Matching question.
 */
export interface MatchQuestion extends BaseQuestion {
  type: "match";
  answers: MatchAnswers;
}

/**
 * Ordering question.
 */
export interface OrderQuestion extends BaseQuestion {
  type: "order";
  answers: OrderAnswers;
}

/**
 * Short-answer question.
 */
export interface ShortAnswerQuestion extends BaseQuestion {
  type: "shortAnswer";
  answers: ShortAnswerAnswers;
}

/**
 * Explanatory-text (informational) question.
 */
export interface ExplanatoryTextQuestion extends BaseQuestion {
  type: "explanatoryText";
  answers: null;
}

/**
 * A stem item: either text or image.
 */
export type StemItem = TextBlock | ImageBlock;

export interface TextBlock {
  type: "text";
  content: string;
}

export interface ImageBlock {
  type: "image";
  url: string;
  format?: "png" | "jpg" | "jpeg" | "webp" | "gif" | "svg";
  width?: number;
  height?: number;
  attribution?: string;
}

/**
 * Multiple-choice answers payload.
 */
export interface MultipleChoiceAnswers {
  options: Array<{ content: StemItem[]; correct: boolean }>;
}

/**
 * Match question answers payload.
 */
export interface MatchAnswers {
  pairs: Array<[StemItem[], StemItem[]]>;
}

/**
 * Ordering question answers payload.
 */
export interface OrderAnswers {
  items: Array<{ content: StemItem; position: number }>;
}

/**
 * Short-answer answers payload.
 */
export interface ShortAnswerAnswers {
  acceptableResponses: string[];
}

//
//
