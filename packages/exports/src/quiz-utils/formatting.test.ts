/**
 * Tests for blank placeholder processing
 */
import { hasBlankPlaceholders, processBlankPlaceholders } from "./formatting";

describe("hasBlankPlaceholders", () => {
  it("should detect curly braces patterns", () => {
    expect(hasBlankPlaceholders("What is {{}}?")).toBe(true);
    expect(hasBlankPlaceholders("What is {{ }}?")).toBe(true);
  });

  it("should detect underscore patterns", () => {
    expect(hasBlankPlaceholders("What is ___?")).toBe(true);
    expect(hasBlankPlaceholders("What is ______?")).toBe(true);
  });

  it("should not detect short underscore patterns", () => {
    expect(hasBlankPlaceholders("What is __?")).toBe(false);
    expect(hasBlankPlaceholders("What is _?")).toBe(false);
  });

  it("should not detect regular text", () => {
    expect(hasBlankPlaceholders("What is the answer?")).toBe(false);
    expect(hasBlankPlaceholders("No blanks here")).toBe(false);
  });
});

describe("processBlankPlaceholders", () => {
  it("should replace curly braces with underlined characters", () => {
    const result = processBlankPlaceholders("What is {{}}?");
    expect(result).toBe("What is ▁▁▁▁▁▁▁▁▁▁?");
  });

  it("should replace curly braces with spaces", () => {
    const result = processBlankPlaceholders("What is {{ }}?");
    expect(result).toBe("What is ▁▁▁▁▁▁▁▁▁▁?");
  });

  it("should replace underscores with underlined characters", () => {
    const result = processBlankPlaceholders("What is ___?");
    expect(result).toBe("What is ▁▁▁▁▁▁▁▁▁▁?");
  });

  it("should replace long underscores with underlined characters", () => {
    const result = processBlankPlaceholders("What is ______?");
    expect(result).toBe("What is ▁▁▁▁▁▁▁▁▁▁?");
  });

  it("should handle multiple blanks in one text", () => {
    const result = processBlankPlaceholders("{{}} + ___ = 10");
    expect(result).toBe("▁▁▁▁▁▁▁▁▁▁ + ▁▁▁▁▁▁▁▁▁▁ = 10");
  });

  it("should not modify text without blanks", () => {
    const result = processBlankPlaceholders("What is the answer?");
    expect(result).toBe("What is the answer?");
  });

  it("should not replace short underscores", () => {
    const result = processBlankPlaceholders("What is __?");
    expect(result).toBe("What is __?");
  });
});
