import { keyLearningPointsInstructions } from "./keyLearningPoints.instructions";

describe("keyLearningPoints instructions", () => {
  it("asks for between 3 and 4 points", () => {
    expect(keyLearningPointsInstructions("ks3")).toMatch(/between 3 and 4/i);
  });

  it("forbids more than 4 points", () => {
    expect(keyLearningPointsInstructions("ks3")).toMatch(/never more than 4/i);
  });
});
