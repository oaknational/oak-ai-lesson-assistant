import { RawLesson } from "../../zod-schema/zodSchema";
import { transformQuiz } from "../transformQuiz";

export function exitQuizPromptPart(rawLesson: RawLesson) {
  const { exitQuiz } = rawLesson;

  const exitQuizQuestions = exitQuiz ? transformQuiz(exitQuiz) : [];
  return exitQuizQuestions.length
    ? `The lesson should include the following exit quiz questions. Include them within the lesson plan's exit quiz:

${JSON.stringify(exitQuizQuestions)}`
    : null;
}
