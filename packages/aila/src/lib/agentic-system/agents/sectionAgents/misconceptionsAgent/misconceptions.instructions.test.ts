import {
  addOneMisconceptionInstructions,
  changeOneMisconceptionInstructions,
  misconceptionsInstructions,
} from "./misconceptions.instructions";

describe("misconception instruction variants", () => {
  it("asks for exactly one new misconception and preserves the existing ones", () => {
    const instructions = addOneMisconceptionInstructions("key-stage-2");
    expect(instructions).toMatch(/exactly ONE/i);
    expect(instructions).toMatch(/do not.*(output|modify|restate)/i);
    expect(instructions).not.toEqual(misconceptionsInstructions("key-stage-2"));
  });

  it("rewrites only the misconception at the given position", () => {
    const instructions = changeOneMisconceptionInstructions(2, "key-stage-2");
    expect(instructions).toContain("2");
    expect(instructions).toMatch(/do not.*(modify|output)/i);
    expect(instructions).not.toEqual(misconceptionsInstructions("key-stage-2"));
  });
});
