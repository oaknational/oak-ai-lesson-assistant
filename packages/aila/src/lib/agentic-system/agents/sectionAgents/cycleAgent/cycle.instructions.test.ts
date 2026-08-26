import { cyclesInstructions } from "./cycle.instructions";
import {
  MAX_SLIDE_LINES,
  STEPS_POINTER_LINE,
  STIMULUS_TYPES,
} from "./practiceTask";

describe("cycle instructions", () => {
  const instructions = cyclesInstructions("ks3");

  it("describes the three practice task parts", () => {
    for (const part of ["TASK INSTRUCTION", "STATEMENTS", "STIMULUS"]) {
      expect(instructions).toContain(part);
    }
  });

  it("carries no trace of the old anatomy", () => {
    // Uppercase-only for the old part names: the key stage guidance uses
    // lowercase "scaffolding" in its everyday pedagogical sense.
    expect(instructions).not.toMatch(/CHUNKING|SCAFFOLDING/);
    expect(instructions).not.toMatch(/sub-question/i);
  });

  it("states the slide line limit from the shared constant", () => {
    expect(instructions).toMatch(
      new RegExp(`at most ${MAX_SLIDE_LINES} lines`, "i"),
    );
  });

  it("lists every stimulus type", () => {
    expect(instructions).toContain(STIMULUS_TYPES.join(", "));
    expect(instructions).toContain("items to sort");
    expect(instructions).not.toContain("statements to sort");
  });

  it("tells the model not to trim the task itself", () => {
    expect(instructions).toMatch(/you do not need to trim anything/i);
  });

  it("bans document references and positional language in the task text", () => {
    expect(instructions).toMatch(/do not invent document names/i);
    expect(instructions).toMatch(/never by position/i);
  });

  it("restricts numbering to statements and exempts stimulus items", () => {
    expect(instructions).toMatch(/numbers must only be used for statements/i);
    expect(instructions).toMatch(/never number them/i);
  });

  it("describes the two-tier trim ladder with both pointer destinations", () => {
    expect(instructions).toContain("on the next slide.");
    expect(instructions).toContain(STEPS_POINTER_LINE);
  });

  it("no longer points pupils at the additional materials", () => {
    expect(instructions).not.toMatch(/in the additional materials/i);
  });

  it("applies the slide limit to feedback", () => {
    expect(instructions).toMatch(/same fixed-size box as the practice task/i);
  });
});
