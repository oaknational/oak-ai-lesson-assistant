import type { RawLesson } from "../../zod-schema/zodSchema";
import { transformQuiz } from "../transformQuiz";

export function starterQuizPromptPart(rawLesson: RawLesson) {
  const { starterQuiz } = rawLesson;

  const starterQuizQuestions = starterQuiz ? transformQuiz(starterQuiz) : [];
  return starterQuizQuestions.length
    ? `The lesson should include the following starter quiz questions. Include them UNEDITED within the lesson plan's starter quiz:

${JSON.stringify(starterQuizQuestions)}`
    : null;
}
