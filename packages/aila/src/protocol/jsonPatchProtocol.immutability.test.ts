import invariant from "tiny-invariant";

import {
  type JsonPatchDocument,
  applyLessonPlanPatchImmutable,
} from "./jsonPatchProtocol";

describe("applyLessonPlanPatchImmutable", () => {
  it("keeps stable object references for keys that haven't changed", () => {
    const lessonPlan = {
      learningCycles: [
        "Identify the key factors that led to the exit of the Romans from Britain",
      ],
      subject: "history",
    };
    const patch: JsonPatchDocument = {
      type: "patch",
      reasoning: "",
      value: {
        op: "replace",
        path: "/subject",
        value: "geography",
      },
    };

    const result = applyLessonPlanPatchImmutable(lessonPlan, patch);
    invariant(result, "result should not be null");

    // The root object should be changed as a child has changed
    expect(result).not.toBe(lessonPlan);
    // Learning cycles haven't changed, so the reference should be the same
    expect(result.learningCycles).toBe(lessonPlan.learningCycles);
    // The subject has changed, so should be a new object
    expect(result.subject).not.toBe(lessonPlan.subject);
  });
});
