import { keyLearningPointsInstructions } from "./keyLearningPoints.instructions";

describe("keyLearningPoints instructions", () => {
  it("asks for 3 or 4 points", () => {
    expect(keyLearningPointsInstructions("ks3")).toMatch(/3 or 4/i);
  });

  it("forbids more than 4 points", () => {
    expect(keyLearningPointsInstructions("ks3")).toMatch(
      /never write more than 4/i,
    );
  });
});
