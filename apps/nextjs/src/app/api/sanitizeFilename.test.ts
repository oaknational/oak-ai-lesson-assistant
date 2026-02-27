import { sanitizeFilename, truncateFilename } from "./sanitizeFilename";

describe("sanitizeFilename", () => {
  it("strips special characters", () => {
    expect(sanitizeFilename("aila: my lesson!")).toBe("aila my lesson");
  });

  it("preserves allowed characters", () => {
    expect(sanitizeFilename("Lesson plan - year 4_v2")).toBe(
      "Lesson plan - year 4_v2",
    );
  });

  it("trims whitespace", () => {
    expect(sanitizeFilename("  hello  ")).toBe("hello");
  });
});

describe("truncateFilename", () => {
  it("returns short titles unchanged", () => {
    expect(truncateFilename("Fractions for year 4")).toBe(
      "Fractions for year 4",
    );
  });

  it("truncates long titles at a word boundary", () => {
    const title =
      "Introduction to equivalent fractions using visual models and number lines";
    const result = truncateFilename(title);
    expect(result.length).toBeLessThanOrEqual(50);
    expect(result).toBe("Introduction to equivalent fractions using visual");
  });

  it("hard-cuts when the only word boundary would lose too much", () => {
    // Space at position 5, then a 50+ char word - breaking at "Short" would
    // keep only 5 chars (less than half of 50), so we hard-cut at 50 instead
    const title = "Short aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const result = truncateFilename(title);
    expect(result.length).toBe(50);
  });

  it("respects custom maxLength", () => {
    const title =
      "Understanding multiplication and division with two-digit numbers";
    const result = truncateFilename(title, 40);
    expect(result.length).toBeLessThanOrEqual(40);
    expect(result).toBe("Understanding multiplication and");
  });
});
