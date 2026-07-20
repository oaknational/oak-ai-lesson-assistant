import { cyclesInstructions } from "./cycle.instructions";

describe("cycle instructions", () => {
  it("caps the practice task at 50 words", () => {
    expect(cyclesInstructions("ks3")).toMatch(/at most 50 words/i);
  });

  it("explains that the slide text box is fixed size", () => {
    expect(cyclesInstructions("ks3")).toMatch(/fixed-size text box/i);
  });

  it("directs overlong stimulus to the additional materials", () => {
    expect(cyclesInstructions("ks3")).toMatch(/additional materials/i);
  });
});
