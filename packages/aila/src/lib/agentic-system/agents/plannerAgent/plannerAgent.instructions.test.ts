import { plannerInstructions } from "./plannerAgent.instructions";

describe("plannerInstructions — quiz intent", () => {
  it("mentions quizIntent so the planner knows to emit it", () => {
    expect(plannerInstructions).toMatch(/quizIntent/);
  });

  it("documents the four quiz action types", () => {
    expect(plannerInstructions).toMatch(/REMOVE_QUIZ_QUESTION/);
    expect(plannerInstructions).toMatch(/ADD_QUIZ_QUESTION/);
    expect(plannerInstructions).toMatch(/CHANGE_QUIZ_QUESTION/);
    expect(plannerInstructions).toMatch(/REGENERATE_QUIZ/);
  });

  it("tells the planner to resolve position from the message", () => {
    expect(plannerInstructions).toMatch(/position/i);
  });

  it("documents the empty-quiz exception (ADD on empty → REGENERATE)", () => {
    expect(plannerInstructions).toMatch(/empty-quiz/i);
  });
});
