import { getMockModerationResult } from "./mockModeration";

describe("getMockModerationResult", () => {
  it("returns toxic for mod:tox", () => {
    const result = getMockModerationResult("mod:tox");
    expect(result?.categories).toContain("t/encouragement-violence");
  });

  it("returns highly-sensitive for mod:hs", () => {
    const result = getMockModerationResult("mod:hs");
    expect(result?.categories).toContain("n/self-harm-suicide");
  });

  it("returns sensitive for mod:sen", () => {
    const result = getMockModerationResult("mod:sen");
    expect(result?.categories).toContain("l/discriminatory-language");
  });

  it("returns null for no trigger", () => {
    expect(getMockModerationResult("hello world")).toBeNull();
  });
});
