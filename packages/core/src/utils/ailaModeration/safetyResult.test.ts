import type { ModerationBase } from "./moderationSchema";
import {
  getSafetyResult,
  isHighlySensitive,
  isSafe,
  isToxic,
} from "./safetyResult";

const mod = (categories: string[]): ModerationBase => ({ categories });

describe("isHighlySensitive", () => {
  it("returns true for n/ categories", () => {
    expect(isHighlySensitive(mod(["n/self-harm-suicide"]))).toBe(true);
    expect(isHighlySensitive(mod(["n/strangulation-suffocation"]))).toBe(true);
  });

  it("returns false for other categories", () => {
    expect(isHighlySensitive(mod(["t/encouragement-violence"]))).toBe(false);
    expect(isHighlySensitive(mod(["l/discriminatory-language"]))).toBe(false);
    expect(isHighlySensitive(mod([]))).toBe(false);
  });
});

describe("getSafetyResult", () => {
  it("returns safe for no categories", () => {
    expect(getSafetyResult(mod([]))).toBe("safe");
  });

  it("returns guidance-required for non-toxic, non-HS categories", () => {
    expect(getSafetyResult(mod(["l/discriminatory-language"]))).toBe(
      "guidance-required",
    );
  });

  it("returns highly-sensitive for n/ categories", () => {
    expect(getSafetyResult(mod(["n/self-harm-suicide"]))).toBe(
      "highly-sensitive",
    );
  });

  it("returns toxic for t/ categories", () => {
    expect(getSafetyResult(mod(["t/encouragement-violence"]))).toBe("toxic");
  });

  it("toxic takes priority over highly-sensitive", () => {
    expect(
      getSafetyResult(mod(["n/self-harm-suicide", "t/encouragement-violence"])),
    ).toBe("toxic");
  });

  it("highly-sensitive takes priority over guidance-required", () => {
    expect(
      getSafetyResult(
        mod(["l/discriminatory-language", "n/self-harm-suicide"]),
      ),
    ).toBe("highly-sensitive");
  });
});

describe("isToxic", () => {
  it("detects t/ prefix", () => {
    expect(isToxic(mod(["t/encouragement-violence"]))).toBe(true);
  });
  it("rejects other prefixes", () => {
    expect(isToxic(mod(["n/self-harm-suicide"]))).toBe(false);
  });
});

describe("isSafe", () => {
  it("returns true for empty categories", () => {
    expect(isSafe(mod([]))).toBe(true);
  });
  it("returns false for any categories", () => {
    expect(isSafe(mod(["l/discriminatory-language"]))).toBe(false);
  });
});
