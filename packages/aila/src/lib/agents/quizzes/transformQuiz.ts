import invariant from "tiny-invariant";

import type { RawQuiz } from "../../../protocol/rawQuizSchema";
import {
  type MatchQuestion,
  type MultipleChoiceQuestion,
  type OrderQuestion,
  type QuizFull,
  type ShortAnswerQuestion,
  type StemItem,
} from "./quiz.types";

/**
 * Transforms a NonNullable<RawQuiz> object into a QuizFull object.
 * This function normalizes and structures the raw quiz data to match the QuizFull interface.
 *
 * @param rawQuiz - The raw quiz data to transform
 * @returns A fully structured quiz object
 */
export function transformQuiz(rawQuiz: NonNullable<RawQuiz>): QuizFull {
  invariant(
    rawQuiz,
    "transformQuiz: rawQuiz is required and cannot be null or undefined",
  );
  // Helper function to transform single choice questions
  // ...

  // Map over the raw quiz data and transform each question
  // ...
}

type RawQuestion = NonNullable<RawQuiz>[number];

function wrapTextAsStemItem(text?: string): StemItem[] {
  return text ? [{ type: "text", content: text }] : [];
}

function transformShortAnswer(question: RawQuestion): ShortAnswerQuestion {
  const shortAnswers = question.answers?.["short-answer"];
  const acceptableResponses = shortAnswers?.flatMap((entry) =>
    entry?.answer?.map((ans) => ans.text),
  );

  return {
    type: "shortAnswer",
    id: question.questionId,
    uid: question.questionUid,
    stem: transformStem(question.questionStem),
    feedback: wrapTextAsStemItem(question.feedback),
    hint: wrapTextAsStemItem(question.hint),
    active: question.active,
    answers: {
      acceptableResponses,
    },
  };
}

function transformMultipleChoice(
  question: RawQuestion,
): MultipleChoiceQuestion {
  const options = question.answers?.["multiple-choice"]?.map((opt) => ({
    content: opt.answer.map((ans) => {
      if (ans?.type === "text") {
        return { type: "text", content: ans.text };
      }
      if (ans?.type === "image") {
        return {
          type: "image",
          content: {
            src: ans.imageObject.url,
            // alt: ans.imageObject.alt,
            // attribution: ans.imageObject.metadata,
          },
        };
      }
    }),
    correct: opt.answer_is_correct,
  }));

  return {
    type: "multipleChoice",
    id: question.questionId,
    uid: question.questionUid,
    stem: transformStem(question.questionStem),
    feedback: wrapTextAsStemItem(question.feedback),
    hint: wrapTextAsStemItem(question.hint),
    active: question.active,
    answers: {
      options,
    },
  };
}

function transformMatch(question: RawQuestion): MatchQuestion {
  const pairs = question.answers.match.map((entry: any) => [
    entry.match_option.map((opt: any) => ({ type: "text", content: opt.text })),
    entry.correct_choice.map((choice: any) => ({
      type: "text",
      content: choice.text,
    })),
  ]);

  return {
    type: "match",
    id: question.questionId,
    uid: question.questionUid,
    stem: transformStem(question.questionStem),
    feedback: wrapTextAsStemItem(question.feedback),
    hint: wrapTextAsStemItem(question.hint),
    active: question.active,
    answers: {
      pairs,
    },
  };
}

function transformOrder(question: RawQuestion): OrderQuestion {
  const items = question.answers.order.map((item: any) => ({
    content: { type: "text", content: item.answer[0].text },
    position: item.correct_order,
  }));

  return {
    type: "order",
    id: question.questionId,
    uid: question.questionUid,
    stem: transformStem(question.questionStem),
    feedback: wrapTextAsStemItem(question.feedback),
    hint: wrapTextAsStemItem(question.hint),
    active: question.active,
    answers: {
      items,
    },
  };
}

transformStem = (stem: OriginalStemItem[]): StemItem[] => {
  return stem.map((item) => {
    if (item.type === "text") {
      return { type: "text", content: item.text };
    }
    if (item.type === "image") {
      return {
        type: "image",
        content: {
          url: item.imageObject.url,
          // alt: item.imageObject.alt,
          // attribution: item.imageObject.metadata,
        },
      };
    }
    throw new Error(`Unknown stem item type: ${item.type}`);
  });
};

type OriginalStemItem =
  | { type: "text"; text: string }
  | {
      type: "image";
      imageObject: {
        url: string;
      };
    };
