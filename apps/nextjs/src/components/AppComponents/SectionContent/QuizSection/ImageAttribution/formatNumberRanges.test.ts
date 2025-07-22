import { formatNumberRanges } from "./formatNumberRanges";

describe("formatNumberRanges", () => {
  it("returns empty string for empty array", () => {
    expect(formatNumberRanges([])).toBe("");
  });

  it("handles single number", () => {
    expect(formatNumberRanges([5])).toBe("Q5");
  });

  it("handles consecutive numbers", () => {
    expect(formatNumberRanges([1, 2, 3])).toBe("Q1-Q3");
  });

  it("handles non-consecutive numbers", () => {
    expect(formatNumberRanges([1, 3, 5])).toBe("Q1,Q3,Q5");
  });

  it("handles mixed consecutive and non-consecutive", () => {
    expect(formatNumberRanges([1, 2, 4, 5, 6])).toBe("Q1-Q2,Q4-Q6");
  });

  it("handles unsorted input", () => {
    expect(formatNumberRanges([5, 1, 3, 2, 4])).toBe("Q1-Q5");
    expect(formatNumberRanges([6, 4, 2, 5, 1])).toBe("Q1-Q2,Q4-Q6");
  });

  it("handles duplicates", () => {
    expect(formatNumberRanges([1, 2, 2, 3, 3, 3])).toBe("Q1-Q3");
  });

  it("handles complex patterns", () => {
    expect(formatNumberRanges([1, 3, 4, 5, 7, 8, 10])).toBe(
      "Q1,Q3-Q5,Q7-Q8,Q10",
    );
  });

  it("handles gaps of different sizes", () => {
    expect(formatNumberRanges([1, 2, 5, 6, 10])).toBe("Q1-Q2,Q5-Q6,Q10");
  });

  it("handles large ranges", () => {
    expect(formatNumberRanges([1, 2, 3, 4, 5, 10, 11, 12])).toBe(
      "Q1-Q5,Q10-Q12",
    );
  });

  it("handles single element ranges at the end", () => {
    expect(formatNumberRanges([1, 2, 3, 5, 7])).toBe("Q1-Q3,Q5,Q7");
  });
});
