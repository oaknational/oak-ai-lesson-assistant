import type { PartialLessonPlan } from "../../../protocol/schema";
import type { PlanStep } from "../schema";
import { normalisePlanSteps } from "./normalisePlanSteps";

const step = (sectionKey: PlanStep["sectionKey"]): PlanStep => ({
  type: "section",
  sectionKey,
  action: "generate",
  sectionInstructions: null,
});

describe("normalisePlanSteps", () => {
  it("orders group 4 steps canonically", () => {
    const plan = [
      step("cycle2"),
      step("exitQuiz"),
      step("cycle1"),
      step("starterQuiz"),
      step("cycle3"),
    ];
    const document: PartialLessonPlan = {
      learningCycles: ["Outcome 1", "Outcome 2", "Outcome 3"],
    };

    expect(normalisePlanSteps(plan, document).map((s) => s.sectionKey)).toEqual(
      ["starterQuiz", "cycle1", "cycle2", "cycle3", "exitQuiz"],
    );
  });

  it("drops cycle3 when there are fewer than three learning cycle outcomes", () => {
    const plan = [step("starterQuiz"), step("cycle1"), step("cycle3")];
    const document: PartialLessonPlan = {
      learningCycles: ["Outcome 1", "Outcome 2"],
    };

    expect(normalisePlanSteps(plan, document).map((s) => s.sectionKey)).toEqual(
      ["starterQuiz", "cycle1"],
    );
  });

  it("drops cycle2 and cycle3 when there is only one learning cycle outcome", () => {
    const plan = [
      step("starterQuiz"),
      step("cycle1"),
      step("cycle2"),
      step("cycle3"),
      step("exitQuiz"),
    ];
    const document: PartialLessonPlan = {
      learningCycles: ["Outcome 1"],
    };

    expect(normalisePlanSteps(plan, document).map((s) => s.sectionKey)).toEqual(
      ["starterQuiz", "cycle1", "exitQuiz"],
    );
  });

  it("preserves non-group-4 step order", () => {
    const plan = [
      step("keywords"),
      step("cycle2"),
      step("title"),
      step("cycle1"),
    ];
    const document: PartialLessonPlan = {
      learningCycles: ["Outcome 1", "Outcome 2"],
    };

    expect(normalisePlanSteps(plan, document).map((s) => s.sectionKey)).toEqual(
      ["keywords", "cycle1", "cycle2", "title"],
    );
  });
});
