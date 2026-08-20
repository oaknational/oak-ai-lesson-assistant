import { cyclesInstructions } from "./cycle.instructions";
import { MAX_SLIDE_LINES, STIMULUS_TYPES } from "./practiceTask";

describe("cycle instructions", () => {
  const instructions = cyclesInstructions("ks3");

  it("describes the four practice task parts", () => {
    for (const part of [
      "INSTRUCTION",
      "CHUNKING",
      "STIMULUS",
      "SCAFFOLDING",
    ]) {
      expect(instructions).toContain(part);
    }
  });

  it("states the slide line limit from the shared constant", () => {
    expect(instructions).toMatch(
      new RegExp(`at most ${MAX_SLIDE_LINES} lines`, "i"),
    );
  });

  it("lists every stimulus type", () => {
    expect(instructions).toContain(STIMULUS_TYPES.join(", "));
  });

  it("tells the model not to trim the task itself", () => {
    expect(instructions).toMatch(/you do not need to trim anything/i);
  });

  it("bans document references in the task text", () => {
    expect(instructions).toMatch(/do not invent document names/i);
  });

  it("allows numbered sub-questions in the instruction only", () => {
    expect(instructions).toMatch(
      /numbers must only be used within the instruction/i,
    );
  });

  it("no longer points pupils at the additional materials", () => {
    expect(instructions).not.toMatch(/in the additional materials/i);
  });

  it("applies the slide limit to feedback", () => {
    expect(instructions).toMatch(
      /same fixed-size box as the practice task/i,
    );
  });
});
