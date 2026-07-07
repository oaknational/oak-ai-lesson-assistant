import {
  addOneQuizInstructions,
  rewriteOneQuizInstructions,
  rewriteOneQuizInstructionsTemplate,
  starterQuizInstructions,
} from "./starterQuiz.instructions";

describe("starterQuiz instructions", () => {
  describe("addOneQuizInstructions", () => {
    it("directs the LLM to generate exactly one question", () => {
      expect(addOneQuizInstructions).toMatch(/exactly one/i);
    });

    it("tells the LLM not to output existing questions", () => {
      expect(addOneQuizInstructions).toMatch(/do not.*output|do not.*modify/i);
    });

    it("is distinct from the full-regen instructions", () => {
      expect(addOneQuizInstructions).not.toBe(starterQuizInstructions);
    });
  });

  describe("rewriteOneQuizInstructions", () => {
    it("is a function that accepts a 1-indexed position", () => {
      expect(typeof rewriteOneQuizInstructions).toBe("function");
    });

    it("includes the given position number in the output", () => {
      expect(rewriteOneQuizInstructions(3)).toMatch(/3/);
    });

    it("tells the LLM to return only the replacement question", () => {
      expect(rewriteOneQuizInstructions(2)).toMatch(/only/i);
    });

    it("is distinct from the full-regen instructions", () => {
      expect(rewriteOneQuizInstructions(1)).not.toBe(starterQuizInstructions);
    });

    it("has a stable template for prompt versioning", () => {
      expect(rewriteOneQuizInstructionsTemplate).toContain("{position}");
    });
  });
});
