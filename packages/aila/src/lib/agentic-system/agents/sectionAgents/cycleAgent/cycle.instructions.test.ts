import { cyclesInstructions } from "./cycle.instructions";
import { FEEDBACK_TYPES } from "./feedback";
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

  it("bans match questions alongside multiple choice and quick recall", () => {
    expect(instructions).toMatch(
      /no multiple choice questions, match questions or other quick recall/i,
    );
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

  it("marks stimulus openers with the ellipsis convention", () => {
    expect(instructions).toContain(
      'a sentence ending in "…" is an opener for pupils to complete',
    );
  });

  it("lists every feedback type", () => {
    for (const type of FEEDBACK_TYPES) {
      expect(instructions).toContain(type);
    }
  });

  it("tells the model that feedback labels and numbering are automatic", () => {
    expect(instructions).toMatch(
      /type label, the colon and any numbering are added automatically/i,
    );
  });

  it("caps feedback at the slide limit with a compression fallback", () => {
    expect(instructions).toMatch(/feedback must fit within the slide limit/i);
    expect(instructions).toMatch(
      /give the key steps or success criteria only/i,
    );
  });

  it("carries no trace of the old feedback rules", () => {
    expect(instructions).not.toMatch(/keyword bank|covalent bonding/i);
  });
});
