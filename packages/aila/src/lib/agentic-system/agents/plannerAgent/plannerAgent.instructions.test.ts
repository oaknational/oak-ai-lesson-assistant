import { plannerInstructions } from "./plannerAgent.instructions";

describe("plannerInstructions: section item intent", () => {
  // Trip-wire: catches wholesale deletion of the SECTION ITEM INTENT paragraph.
  // The substantive behaviour is verified by scorePlannerQuizIntent.
  it("documents the four section item action enum values", () => {
    expect(plannerInstructions).toMatch(/REMOVE_ITEM/);
    expect(plannerInstructions).toMatch(/ADD_ITEM/);
    expect(plannerInstructions).toMatch(/CHANGE_ITEM/);
    expect(plannerInstructions).toMatch(/REGENERATE_SECTION/);
  });
});
