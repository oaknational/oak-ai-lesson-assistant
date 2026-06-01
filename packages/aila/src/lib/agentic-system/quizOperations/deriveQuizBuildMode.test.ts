import type { PlanStep } from "../schema";
import { deriveQuizBuildMode } from "./deriveQuizBuildMode";

function step(intent?: PlanStep["quizIntent"]): PlanStep {
  return {
    type: "section",
    sectionKey: "starterQuiz",
    action: "generate",
    sectionInstructions: null,
    quizIntent: intent,
  };
}

describe("deriveQuizBuildMode", () => {
  it("returns fullRegen when no step is provided", () => {
    expect(deriveQuizBuildMode(null)).toEqual({ kind: "fullRegen" });
  });

  it("returns fullRegen when step has no quizIntent", () => {
    expect(deriveQuizBuildMode(step())).toEqual({ kind: "fullRegen" });
  });

  it("returns rewriteOne with position for CHANGE_QUIZ_QUESTION", () => {
    expect(
      deriveQuizBuildMode(
        step({ action: "CHANGE_QUIZ_QUESTION", position: 3 }),
      ),
    ).toEqual({ kind: "rewriteOne", position: 3 });
  });

  it("throws when CHANGE_QUIZ_QUESTION arrives without a position", () => {
    // Invariant violation: dispatcher must return a note before calling the agent
    // when position is null. Throwing here surfaces an upstream bug rather than
    // silently degrading.
    expect(() =>
      deriveQuizBuildMode(
        step({ action: "CHANGE_QUIZ_QUESTION", position: null }),
      ),
    ).toThrow();
  });

  it("throws for REMOVE_QUIZ_QUESTION", () => {
    // REMOVE is handled deterministically by the dispatcher — it should never
    // reach the composer-bound handler.
    expect(() =>
      deriveQuizBuildMode(
        step({ action: "REMOVE_QUIZ_QUESTION", position: 1 }),
      ),
    ).toThrow();
  });
});
