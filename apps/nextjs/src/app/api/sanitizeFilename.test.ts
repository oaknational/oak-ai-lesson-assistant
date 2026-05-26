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

  it("returns empty string for empty input", () => {
    expect(sanitizeFilename("")).toBe("");
  });

  it("returns empty string when input is only special characters", () => {
    expect(sanitizeFilename("!!!@@@###")).toBe("");
  });

  it("strips path traversal characters", () => {
    expect(sanitizeFilename("../etc/passwd")).toBe("etcpasswd");
    expect(sanitizeFilename("..\\windows\\system32")).toBe("windowssystem32");
  });

  it("strips non-ASCII characters", () => {
    expect(sanitizeFilename("Mathématiques")).toBe("Mathmatiques");
    expect(sanitizeFilename("café au lait")).toBe("caf au lait");
    expect(sanitizeFilename("日本語")).toBe("");
  });

  it("preserves multiple internal spaces", () => {
    expect(sanitizeFilename("hello    world")).toBe("hello    world");
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

  it("returns empty string when maxLength is 0", () => {
    expect(truncateFilename("hello", 0)).toBe("");
  });

  it("returns input unchanged when length equals maxLength", () => {
    const exact = "x".repeat(50);
    expect(truncateFilename(exact)).toBe(exact);
  });

  it("returns empty string for empty input", () => {
    expect(truncateFilename("")).toBe("");
  });

  it("hard-cuts when there are no spaces at all", () => {
    const noSpaces = "a".repeat(100);
    expect(truncateFilename(noSpaces)).toBe("a".repeat(50));
  });
});

describe("sanitizeFilename then truncateFilename", () => {
  it("matches the route call pattern and produces a safe, bounded filename", () => {
    const dirty =
      "aila: Introduction to equivalent fractions using visual models!!!";
    const result = truncateFilename(sanitizeFilename(dirty));
    expect(result.length).toBeLessThanOrEqual(50);
    expect(result).not.toMatch(/[^a-zA-Z0-9 _-]/);
    expect(result).toBe("aila Introduction to equivalent fractions using");
  });
});
