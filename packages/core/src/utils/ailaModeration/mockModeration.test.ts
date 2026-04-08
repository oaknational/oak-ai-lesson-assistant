import { getMockModerationResult } from "./mockModeration";

describe("getMockModerationResult", () => {
  it("returns toxic for oak-tox", () => {
    const result = getMockModerationResult("oak-tox");
    expect(result?.categories).toContain("t/encouragement-violence");
  });

  it("returns highly-sensitive for oak-hs", () => {
    const result = getMockModerationResult("oak-hs");
    expect(result?.categories).toContain("n/self-harm-suicide");
  });

  it("returns sensitive for oak-sen", () => {
    const result = getMockModerationResult("oak-sen");
    expect(result?.categories).toContain("l/discriminatory-language");
  });

  it("returns null for no trigger", () => {
    expect(getMockModerationResult("hello world")).toBeNull();
  });
});
