import type { QuizBuildMode } from "../../../core/quiz/interfaces";
import type { PlanStep } from "../schema";

/**
 * Translate the planner-emitted quizIntent on a PlanStep into a QuizBuildMode
 * for the quiz composer. Called at the handler boundary so the composer layer
 * stays unaware of agentic-system enums.
 */
export function deriveQuizBuildMode(step: PlanStep | null): QuizBuildMode {
  const intent = step?.quizIntent;
  if (!intent) return { kind: "fullRegen" };

  switch (intent.action) {
    case "REGENERATE_QUIZ":
      return { kind: "fullRegen" };
    case "ADD_QUIZ_QUESTION":
      return { kind: "addOne" };
    case "CHANGE_QUIZ_QUESTION":
      if (intent.position == null) {
        throw new Error(
          "CHANGE_QUIZ_QUESTION reached the quiz handler with a null position; the dispatcher should have returned a note upstream.",
        );
      }
      return { kind: "rewriteOne", position: intent.position };
    case "REMOVE_QUIZ_QUESTION":
      throw new Error(
        "REMOVE_QUIZ_QUESTION must be handled deterministically by the dispatcher and must not reach the composer-bound handler.",
      );
  }
}
