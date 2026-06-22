import {
  addOneMisconceptionInstructions,
  changeOneMisconceptionInstructions,
  misconceptionsInstructions,
} from "./misconceptions.instructions";

describe("misconception instruction variants", () => {
  it("asks for exactly one new misconception and preserves the existing ones", () => {
    expect(addOneMisconceptionInstructions).toMatch(/exactly ONE/i);
    expect(addOneMisconceptionInstructions).toMatch(
      /do not.*(output|modify|restate)/i,
    );
    expect(addOneMisconceptionInstructions).not.toEqual(
      misconceptionsInstructions,
    );
  });

  it("rewrites only the misconception at the given position", () => {
    const instructions = changeOneMisconceptionInstructions(2);
    expect(instructions).toContain("2");
    expect(instructions).toMatch(/do not.*(modify|output)/i);
    expect(instructions).not.toEqual(misconceptionsInstructions);
  });
});
