import { getDisplayCategories, getSafetyResult, isToxic } from "./helpers";
import type { ModerationBase } from "./moderationSchema";

function modResult(categories: string[]): ModerationBase {
  return { categories };
}

describe("isToxic", () => {
  it("returns true for t/ codes", () => {
    expect(isToxic(modResult(["t/guides-self-harm-suicide"]))).toBe(true);
  });

  it("returns true for n/ codes", () => {
    expect(isToxic(modResult(["n/self-harm-suicide"]))).toBe(true);
  });

  it("returns false for soft-warning codes", () => {
    expect(isToxic(modResult(["l/discriminatory-language"]))).toBe(false);
  });

  it("returns false for empty categories", () => {
    expect(isToxic(modResult([]))).toBe(false);
  });
});

describe("getSafetyResult", () => {
  it("returns safe for empty categories", () => {
    expect(getSafetyResult(modResult([]))).toBe("safe");
  });

  it("returns guidance-required for soft-warning codes", () => {
    expect(getSafetyResult(modResult(["l/discriminatory-language"]))).toBe(
      "guidance-required",
    );
  });

  it("returns toxic for n/ codes", () => {
    expect(getSafetyResult(modResult(["n/self-harm-suicide"]))).toBe("toxic");
  });

  it("returns toxic for t/ codes", () => {
    expect(getSafetyResult(modResult(["t/guides-self-harm-suicide"]))).toBe(
      "toxic",
    );
  });
});

describe("getDisplayCategories", () => {
  it("returns structured data for a single Oak Service category", () => {
    const result = getDisplayCategories(
      modResult(["l/discriminatory-language"]),
    );
    expect(result).toEqual([
      {
        code: "l/discriminatory-language",
        shortDescription: "Discriminatory behaviour or language",
        longDescription: expect.stringContaining("discriminatory behaviour"),
        severityLevel: "content-guidance",
      },
    ]);
  });

  it("returns multiple categories with their severity levels", () => {
    const result = getDisplayCategories(
      modResult(["l/discriminatory-language", "r/recent-content"]),
    );
    expect(result).toHaveLength(2);
    expect(result[0]?.severityLevel).toBe("content-guidance");
    expect(result[1]?.severityLevel).toBe("enhanced-scrutiny");
  });

  it("returns heightened-caution for e/ categories", () => {
    const result = getDisplayCategories(modResult(["e/rshe-content"]));
    expect(result).toEqual([
      {
        code: "e/rshe-content",
        shortDescription: "RSHE content",
        longDescription: expect.stringContaining("RSHE"),
        severityLevel: "heightened-caution",
      },
    ]);
  });

  it("returns empty array for empty categories", () => {
    expect(getDisplayCategories(modResult([]))).toEqual([]);
  });

  it("skips unknown category codes", () => {
    expect(getDisplayCategories(modResult(["x/unknown"]))).toEqual([]);
  });
});
