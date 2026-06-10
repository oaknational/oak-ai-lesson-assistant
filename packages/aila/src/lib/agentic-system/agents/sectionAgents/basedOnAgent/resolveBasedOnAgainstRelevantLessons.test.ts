import type { AgenticRagLessonPlanResult } from "../../../types";
import { resolveBasedOnAgainstRelevantLessons } from "./resolveBasedOnAgainstRelevantLessons";

const relevantLessons: AgenticRagLessonPlanResult[] = [
  {
    ragLessonPlanId: "lp1",
    oakLessonId: 1,
    oakLessonSlug: "angles-in-triangles",
    lessonPlan: { title: "Angles in triangles" },
  },
  {
    ragLessonPlanId: "lp2",
    oakLessonId: 2,
    oakLessonSlug: "missing-angles",
    lessonPlan: { title: "Missing angles" },
  },
];

describe("resolveBasedOnAgainstRelevantLessons", () => {
  it("restores the offered lesson's title when the id matches", () => {
    const result = resolveBasedOnAgainstRelevantLessons(
      { id: "lp1", title: "Constructing angle bisectors" },
      relevantLessons,
    );

    expect(result).toEqual({ id: "lp1", title: "Angles in triangles" });
  });

  it("restores the offered lesson's id when only the title matches", () => {
    const result = resolveBasedOnAgainstRelevantLessons(
      { id: "made-up-id", title: "missing angles" },
      relevantLessons,
    );

    expect(result).toEqual({ id: "lp2", title: "Missing angles" });
  });

  it("returns the value unchanged when nothing matches", () => {
    const basedOn = { id: "made-up-id", title: "A lesson never offered" };

    const result = resolveBasedOnAgainstRelevantLessons(
      basedOn,
      relevantLessons,
    );

    expect(result).toEqual(basedOn);
  });

  it("returns the value unchanged when no lessons were offered", () => {
    const basedOn = { id: "lp1", title: "Angles in triangles" };

    expect(resolveBasedOnAgainstRelevantLessons(basedOn, null)).toEqual(
      basedOn,
    );
    expect(resolveBasedOnAgainstRelevantLessons(basedOn, [])).toEqual(basedOn);
  });
});
