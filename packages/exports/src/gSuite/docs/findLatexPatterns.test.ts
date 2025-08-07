import { findLatexPatterns, generateLatexHash } from "./findLatexPatterns";

describe("generateLatexHash", () => {
  it("generates consistent hash for same input", () => {
    const latex = "x = 5";
    const hash1 = generateLatexHash(latex);
    const hash2 = generateLatexHash(latex);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(12);
  });

  it("generates different hashes for different inputs", () => {
    const hash1 = generateLatexHash("x = 5");
    const hash2 = generateLatexHash("y = 10");

    expect(hash1).not.toBe(hash2);
  });
});

describe("findLatexPatterns", () => {
  it("finds single inline LaTeX pattern", () => {
    const text = "This is a formula $$ x = 5 $$ in text.";
    const patterns = findLatexPatterns(text);

    expect(patterns).toHaveLength(1);
    expect(patterns[0]).toEqual({
      latex: "x = 5",
      type: "inline",
      startIndex: 18,
      endIndex: 29,
      hash: expect.any(String),
    });
  });

  it("finds multiple LaTeX patterns", () => {
    const text = "First $$ a = 1 $$ and second $$ b = 2 $$.";
    const patterns = findLatexPatterns(text);

    expect(patterns).toHaveLength(2);
    expect(patterns[0]?.latex).toBe("a = 1");
    expect(patterns[1]?.latex).toBe("b = 2");
  });

  it("trims whitespace inside delimiters", () => {
    const text = "Formula: $$  x = 5  $$.";
    const patterns = findLatexPatterns(text);

    expect(patterns).toHaveLength(1);
    expect(patterns[0]?.latex).toBe("x = 5");
  });

  it("returns empty array when no patterns found", () => {
    const text = "No LaTeX here!";
    const patterns = findLatexPatterns(text);

    expect(patterns).toEqual([]);
  });

  it("handles complex LaTeX expressions", () => {
    const text = "Quadratic: $$ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} $$.";
    const patterns = findLatexPatterns(text);

    expect(patterns).toHaveLength(1);
    expect(patterns[0]?.latex).toBe(
      "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    );
  });

  it("doesn't match single $ delimiters", () => {
    const text = "Price is $5 and cost is $10.";
    const patterns = findLatexPatterns(text);

    expect(patterns).toEqual([]);
  });

  it("sorts patterns by startIndex", () => {
    const text = "Third $$ c = 3 $$ first $$ a = 1 $$ second $$ b = 2 $$.";
    const patterns = findLatexPatterns(text);

    expect(patterns).toHaveLength(3);
    expect(patterns[0]?.latex).toBe("c = 3");
    expect(patterns[1]?.latex).toBe("a = 1");
    expect(patterns[2]?.latex).toBe("b = 2");
    expect(patterns[0]?.startIndex).toBeLessThan(patterns[1]?.startIndex ?? 0);
    expect(patterns[1]?.startIndex).toBeLessThan(patterns[2]?.startIndex ?? 0);
  });

  it("handles patterns with newlines", () => {
    const text = "Multi-line: $$ x = 1 +\n2 + 3 $$.";
    const patterns = findLatexPatterns(text);

    expect(patterns).toHaveLength(1);
    expect(patterns[0]?.latex).toBe("x = 1 +\n2 + 3");
  });

  it("handles empty LaTeX patterns", () => {
    const text = "Empty: $$  $$ pattern.";
    const patterns = findLatexPatterns(text);

    expect(patterns).toHaveLength(1);
    expect(patterns[0]?.latex).toBe("");
  });

  it("correctly calculates indices", () => {
    const text = "Before $$ x = 5 $$ after";
    const patterns = findLatexPatterns(text);

    expect(patterns).toHaveLength(1);
    const pattern = patterns[0];
    expect(pattern).toBeDefined();
    expect(text.substring(pattern!.startIndex, pattern!.endIndex)).toBe(
      "$$ x = 5 $$",
    );
  });
});
