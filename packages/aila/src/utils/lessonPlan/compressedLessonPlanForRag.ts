import type { PartialLessonPlan } from "../../protocol/schema";

/**
 * Compresses a lesson plan to a stringified JSON object, excluding the exit and starter quizzes
 * @param lessonPlan
 * @returns
 *
 * @example
 * const lessonPlan = {
 *  title: "My Lesson",
 * subject: "Maths",
 * keyStage: "KS3",
 * topic: "Algebra",
 * starterQuiz: { ... },
 * exitQuiz: { ... },
 * }
 *
 * compressedLessonPlanForRag(lessonPlan)
 * // Returns: '{"title":"My Lesson","subject":"Maths","keyStage":"KS3","topic":"Algebra"}'
 *
 */
export function compressedLessonPlanForRag(lessonPlan: PartialLessonPlan) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { exitQuiz, starterQuiz, ...rest } = lessonPlan;
  return JSON.stringify(rest);
}
