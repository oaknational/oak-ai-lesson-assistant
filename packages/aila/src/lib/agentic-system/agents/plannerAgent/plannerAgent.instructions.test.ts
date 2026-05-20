import { plannerInstructions } from "./plannerAgent.instructions";

describe("plannerInstructions — quiz intent", () => {
  // Trip-wire: catches wholesale deletion of the QUIZ INTENT paragraph.
  // The substantive behaviour is verified by scorePlannerQuizIntent.
  it("documents the four quiz action enum values", () => {
    expect(plannerInstructions).toMatch(/REMOVE_QUIZ_QUESTION/);
    expect(plannerInstructions).toMatch(/ADD_QUIZ_QUESTION/);
    expect(plannerInstructions).toMatch(/CHANGE_QUIZ_QUESTION/);
    expect(plannerInstructions).toMatch(/REGENERATE_QUIZ/);
  });
});
