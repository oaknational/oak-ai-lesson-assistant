import type { QuizBuildMode } from "../../../core/quiz/interfaces";
import type { PlanStep } from "../schema";

/**
 * Translate the planner-emitted itemIntent on a PlanStep into a build mode for
 * the mode-aware section agents (and the quiz composer). Called at the handler
 * boundary so the composer/agent layer stays unaware of agentic-system enums.
 * The mode union is shared with the quiz composer (QuizBuildMode).
 */
export function deriveSectionBuildMode(step: PlanStep | null): QuizBuildMode {
  const intent = step?.itemIntent;
  if (!intent) return { kind: "fullRegen" };

  switch (intent.action) {
    case "REGENERATE_SECTION":
      return { kind: "fullRegen" };
    case "ADD_ITEM":
      return { kind: "addOne" };
    case "CHANGE_ITEM":
      if (intent.position == null) {
        throw new Error(
          "CHANGE_ITEM reached the section handler with a null position; the dispatcher should have returned a note upstream.",
        );
      }
      return { kind: "rewriteOne", position: intent.position };
    case "REMOVE_ITEM":
      throw new Error(
        "REMOVE_ITEM must be handled deterministically by the dispatcher and must not reach the composer-bound handler.",
      );
  }
}
