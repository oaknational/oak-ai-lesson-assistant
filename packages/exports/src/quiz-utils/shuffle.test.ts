import {
  shuffleMatchItems,
  shuffleMultipleChoiceAnswers,
  shuffleOrderItems,
} from "./shuffle";

describe("shuffleMultipleChoiceAnswers", () => {
  describe("letter answer pattern detection", () => {
    it("should maintain alphabetical order for Line A/B/C/D pattern", () => {
      const answers = ["Line B"];
      const distractors = ["Line A", "Line C", "Line D"];

      const result = shuffleMultipleChoiceAnswers(answers, distractors);

      expect(result.map((r) => r.text)).toEqual([
        "Line A",
        "Line B",
        "Line C",
        "Line D",
      ]);

      // Verify correct answer marking
      expect(result.find((r) => r.text === "Line B")?.isCorrect).toBe(true);
      expect(result.find((r) => r.text === "Line A")?.isCorrect).toBe(false);
    });

    it("should maintain alphabetical order for Option A/B/C pattern", () => {
      const answers = ["Option C"];
      const distractors = ["Option A", "Option B"];

      const result = shuffleMultipleChoiceAnswers(answers, distractors);

      expect(result.map((r) => r.text)).toEqual([
        "Option A",
        "Option B",
        "Option C",
      ]);
    });

    it("should maintain alphabetical order for Figure a/b/c/d pattern", () => {
      const answers = ["Figure d", "Figure a"];
      const distractors = ["Figure b", "Figure c"];

      const result = shuffleMultipleChoiceAnswers(answers, distractors);

      expect(result.map((r) => r.text)).toEqual([
        "Figure a",
        "Figure b",
        "Figure c",
        "Figure d",
      ]);

      // Verify both correct answers are marked
      expect(result.find((r) => r.text === "Figure a")?.isCorrect).toBe(true);
      expect(result.find((r) => r.text === "Figure d")?.isCorrect).toBe(true);
      expect(result.find((r) => r.text === "Figure b")?.isCorrect).toBe(false);
      expect(result.find((r) => r.text === "Figure c")?.isCorrect).toBe(false);
    });

    it("should handle standalone letters A/B/C/D", () => {
      const answers = ["C"];
      const distractors = ["A", "B", "D"];

      const result = shuffleMultipleChoiceAnswers(answers, distractors);

      expect(result.map((r) => r.text)).toEqual(["A", "B", "C", "D"]);
      expect(result.find((r) => r.text === "C")?.isCorrect).toBe(true);
    });

    it("should handle letters with punctuation", () => {
      const answers = ["Line A:"];
      const distractors = ["Line B:", "Line C:", "Line D:"];

      const result = shuffleMultipleChoiceAnswers(answers, distractors);

      expect(result.map((r) => r.text)).toEqual([
        "Line A:",
        "Line B:",
        "Line C:",
        "Line D:",
      ]);
    });

    it("should handle multiple letters in same template", () => {
      const answers = ["From A to B"];
      const distractors = ["From C to D", "From A to C"];

      const result = shuffleMultipleChoiceAnswers(answers, distractors);

      // All have same template "From  to " after stripping A/B/C/D
      expect(result.map((r) => r.text)).toEqual([
        "From A to B",
        "From A to C",
        "From C to D",
      ]);
    });
  });

  describe("non-pattern shuffling", () => {
    it("should shuffle answers without letter patterns deterministically", () => {
      const answers = ["Apple"];
      const distractors = ["Banana", "Cherry", "Date"];

      const result1 = shuffleMultipleChoiceAnswers(answers, distractors);
      const result2 = shuffleMultipleChoiceAnswers(answers, distractors);

      // Results should be deterministic (same order every time)
      expect(result1.map((r) => r.text)).toEqual(result2.map((r) => r.text));

      // Should not be in original order (unless very unlikely)
      const originalOrder = ["Apple", "Banana", "Cherry", "Date"];
      expect(result1.map((r) => r.text)).not.toEqual(originalOrder);

      // Verify correct answer marking
      expect(result1.find((r) => r.text === "Apple")?.isCorrect).toBe(true);
    });

    it("should not apply letter sorting to words containing A/B/C/D", () => {
      const answers = ["Apple"];
      const distractors = ["Banana", "Data", "Basic"];

      const result = shuffleMultipleChoiceAnswers(answers, distractors);

      // Templates are "Apple", "Banana", "Data", "Basic" - all different
      // Should not be alphabetically ordered by the A/B/D letters
      expect(result.map((r) => r.text)).not.toEqual([
        "Apple",
        "Banana",
        "Basic",
        "Data",
      ]);
    });

    it("should handle mixed patterns correctly", () => {
      const answers = ["Line A"];
      const distractors = ["Apple", "Line B", "Banana"];

      const result = shuffleMultipleChoiceAnswers(answers, distractors);

      // Since patterns don't match, should use hash-based shuffling
      const result2 = shuffleMultipleChoiceAnswers(answers, distractors);
      expect(result.map((r) => r.text)).toEqual(result2.map((r) => r.text));
    });
  });
});

describe("shuffleOrderItems", () => {
  it("should shuffle items deterministically while preserving original indices", () => {
    const items = ["First", "Second", "Third", "Fourth"];

    const result1 = shuffleOrderItems(items);
    const result2 = shuffleOrderItems(items);

    // Results should be deterministic
    expect(result1).toEqual(result2);

    // Should have correct indices
    expect(result1.find((r) => r.text === "First")?.correctIndex).toBe(1);
    expect(result1.find((r) => r.text === "Second")?.correctIndex).toBe(2);
    expect(result1.find((r) => r.text === "Third")?.correctIndex).toBe(3);
    expect(result1.find((r) => r.text === "Fourth")?.correctIndex).toBe(4);
  });
});

describe("shuffleMatchItems", () => {
  it("should shuffle items deterministically and assign letter labels", () => {
    const items = ["First", "Second", "Third"];

    const result1 = shuffleMatchItems(items);
    const result2 = shuffleMatchItems(items);

    // Results should be deterministic
    expect(result1).toEqual(result2);

    // Should have correct labels
    const labels = result1.map((r) => r.label);
    expect(labels).toEqual(expect.arrayContaining(["a", "b", "c"]));
    expect(labels).toHaveLength(3);
  });
});
