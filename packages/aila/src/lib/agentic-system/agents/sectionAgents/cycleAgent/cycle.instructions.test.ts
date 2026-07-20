import { cyclesInstructions } from "./cycle.instructions";

describe("cycle instructions", () => {
  it("caps the practice task at 12 lines", () => {
    expect(cyclesInstructions("ks3")).toMatch(/at most 12 lines/i);
  });

  it("explains that the slide text box is fixed size", () => {
    expect(cyclesInstructions("ks3")).toMatch(/fixed-size text box/i);
  });

  it("directs overlong stimulus to the additional materials", () => {
    expect(cyclesInstructions("ks3")).toMatch(/additional materials/i);
  });

  it("applies the same slide limit to feedback", () => {
    expect(cyclesInstructions("ks3")).toMatch(
      /same fixed-size box as the practice task/i,
    );
  });
});
