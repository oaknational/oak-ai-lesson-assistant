import type { PlanStep } from "../schema";
import { deriveSectionBuildMode } from "./deriveSectionBuildMode";

function step(intent?: PlanStep["itemIntent"]): PlanStep {
  return {
    type: "section",
    sectionKey: "starterQuiz",
    action: "generate",
    sectionInstructions: null,
    itemIntent: intent,
  };
}

describe("deriveSectionBuildMode", () => {
  it("returns fullRegen when no step is provided", () => {
    expect(deriveSectionBuildMode(null)).toEqual({ kind: "fullRegen" });
  });

  it("returns fullRegen when step has no itemIntent", () => {
    expect(deriveSectionBuildMode(step())).toEqual({ kind: "fullRegen" });
  });

  it("returns rewriteOne with position for CHANGE_ITEM", () => {
    expect(
      deriveSectionBuildMode(step({ action: "CHANGE_ITEM", position: 3 })),
    ).toEqual({ kind: "rewriteOne", position: 3 });
  });

  it("throws when CHANGE_ITEM arrives without a position", () => {
    // A null position should never reach here (the dispatcher returns a note
    // first), so this throws instead of failing silently.
    expect(() =>
      deriveSectionBuildMode(step({ action: "CHANGE_ITEM", position: null })),
    ).toThrow();
  });

  it("throws for REMOVE_ITEM", () => {
    // REMOVE is handled deterministically by the dispatcher; it must never reach
    // the composer-bound handler.
    expect(() =>
      deriveSectionBuildMode(step({ action: "REMOVE_ITEM", position: 1 })),
    ).toThrow();
  });
});
