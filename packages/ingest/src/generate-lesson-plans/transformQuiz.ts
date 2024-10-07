import { Quiz } from "@oakai/aila/src/protocol/schema";
import { isTruthy } from "remeda";

import { IngestError } from "../IngestError";
import { OakLessonQuiz } from "../zod-schema/zodSchema";

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
    if (!question.answers["multiple-choice"]) {
      continue;
    }
    if (
      !question.answers["multiple-choice"].every(
        (answer) => !answer?.answer?.every((a) => a?.type !== "text"),
      )
    ) {
      continue;
    }

    const answers = question.answers["multiple-choice"]
      .filter((a) => a?.answer_is_correct)
      .map((a) => a?.answer?.map((a) => a?.text).join(" "))
      .filter(isTruthy);

    const distractors = question.answers["multiple-choice"]
      .filter((a) => !a?.answer_is_correct)
      .map((a) => a?.answer?.map((a) => a?.text).join(" "))
      .filter(isTruthy);

    quiz.push({
      question: question.questionStem.map((stem) => stem.text).join(" "),
      answers,
      distractors,
    });
  }

  return quiz;
}
