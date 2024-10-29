import type { Quiz } from "@oakai/aila/src/protocol/schema";
import { isTruthy, partition } from "remeda";

import { IngestError } from "../IngestError";
import type { OakLessonQuiz } from "../zod-schema/zodSchema";

export function transformQuiz(oakQuiz: OakLessonQuiz): Quiz {
  const quiz: Quiz = [];

  for (const question of oakQuiz) {
    if (question.questionType !== "multiple-choice") {
      continue;
    }
    if (!question.questionStem.every((stem) => stem.type === "text")) {
      continue;
    }
    if (question.questionStem.length > 1) {
      // I think questions where each stem is type text, will only have one part.
      // We want to know if this is not the case so that we can handle it appropriately.
      throw new IngestError("Question stem must have at most one part");
    }
    if (!question.answers?.["multiple-choice"]) {
      continue;
    }
    if (
      !question.answers["multiple-choice"].every(
        (answer) => !answer?.answer?.every((a) => a?.type !== "text"),
      )
    ) {
      continue;
    }

    const [correctAnswers, incorrectAnswers] = partition(
      question.answers["multiple-choice"],
      (a) => Boolean(a?.answer_is_correct),
    );

    const answers = correctAnswers
      .map((a) => a?.answer?.map((a) => a?.text).join(" "))
      .filter(isTruthy);
    const distractors = incorrectAnswers
      .map((a) => a?.answer?.map((a) => a?.text).join(" "))
      .filter(isTruthy);

    quiz.push({
      question: getQuestionText(question),
      answers,
      distractors,
    });
  }

  return quiz;
}

function getQuestionText(question: OakLessonQuiz[number]): string {
  return question.questionStem.map((stem) => stem.text).join(" ");
}
