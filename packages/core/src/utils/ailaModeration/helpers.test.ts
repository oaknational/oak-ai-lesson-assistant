import {
  getMockModerationResult,
  getSafetyResult,
  isHighlySensitive,
  isSafe,
  isToxic,
  moderationGuidanceText,
} from "./helpers";
import type { ModerationBase } from "./moderationSchema";

const mod = (categories: string[]): ModerationBase => ({ categories });

describe("isHighlySensitive", () => {
  it("returns true for n/ categories", () => {
    expect(isHighlySensitive(mod(["n/self-harm-suicide"]))).toBe(true);
    expect(isHighlySensitive(mod(["n/strangulation-suffocation"]))).toBe(true);
  });

  it("returns false for other categories", () => {
    expect(isHighlySensitive(mod(["t/encouragement-violence"]))).toBe(false);
    expect(isHighlySensitive(mod(["l/strong-language"]))).toBe(false);
    expect(isHighlySensitive(mod([]))).toBe(false);
  });
});

describe("getSafetyResult", () => {
  it("returns safe for no categories", () => {
    expect(getSafetyResult(mod([]))).toBe("safe");
  });

  it("returns guidance-required for non-toxic, non-HS categories", () => {
    expect(getSafetyResult(mod(["l/strong-language"]))).toBe(
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
      getSafetyResult(mod(["l/strong-language", "n/self-harm-suicide"])),
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
    expect(isSafe(mod(["l/strong-language"]))).toBe(false);
  });
});

describe("moderationGuidanceText", () => {
  it("returns longMessage for a single Oak Service category", () => {
    expect(moderationGuidanceText(mod(["u/violence-or-suffering"]))).toBe(
      "This lesson contains violence or suffering (e.g., war, famine, disasters, or animal cruelty). Some pupils may find this distressing. Please check this content carefully.",
    );
  });

  it("returns comma-separated shortMessages for multiple categories", () => {
    expect(
      moderationGuidanceText(
        mod(["u/violence-or-suffering", "l/discriminatory-language"]),
      ),
    ).toBe(
      "Contains violence or suffering, discriminatory behaviour or language. Check content carefully.",
    );
  });

  it("falls back to userDescription for legacy v0 categories", () => {
    expect(moderationGuidanceText(mod(["l/strong-language"]))).toBe(
      "Contains strong language. Check content carefully.",
    );
  });
});

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
    expect(result?.categories).toContain("l/strong-language");
  });

  it("returns null for no trigger", () => {
    expect(getMockModerationResult("hello world")).toBeNull();
  });
});
