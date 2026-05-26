import { getThreatDetectionProvider } from "../provider";

describe("getThreatDetectionProvider", () => {
  it("defaults to model_armor", () => {
    expect(getThreatDetectionProvider()).toBe("model_armor");
  });
});
