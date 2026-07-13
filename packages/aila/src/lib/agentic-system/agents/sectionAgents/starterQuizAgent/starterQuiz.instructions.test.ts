import {
  addOneQuizInstructions,
  rewriteOneQuizInstructions,
  starterQuizInstructions,
} from "./starterQuiz.instructions";

describe("starterQuiz instructions", () => {
  describe("starterQuizInstructions", () => {
    it("binds questions to the prior knowledge to assess section", () => {
      expect(starterQuizInstructions("ks2")).toMatch(
        /PRIOR KNOWLEDGE TO ASSESS/,
      );
    });
  });

  describe("addOneQuizInstructions", () => {
    it("binds the new question to the prior knowledge to assess section", () => {
      expect(addOneQuizInstructions("ks2")).toMatch(
        /PRIOR KNOWLEDGE TO ASSESS/,
      );
    });

    it("directs the LLM to generate exactly one question", () => {
      expect(addOneQuizInstructions("ks2")).toMatch(/exactly one/i);
    });

    it("tells the LLM not to output existing questions", () => {
      expect(addOneQuizInstructions("ks2")).toMatch(
        /do not.*output|do not.*modify/i,
      );
    });

    it("is distinct from the full-regen instructions", () => {
      expect(addOneQuizInstructions("ks2")).not.toBe(
        starterQuizInstructions("ks2"),
      );
    });

    it("includes key-stage-specific question guidance", () => {
      expect(addOneQuizInstructions("ks2")).toContain("For key stage 1 and 2");
    });
  });

  describe("rewriteOneQuizInstructions", () => {
    it("binds the replacement question to the prior knowledge to assess section", () => {
      expect(rewriteOneQuizInstructions(2, "ks2")).toMatch(
        /PRIOR KNOWLEDGE TO ASSESS/,
      );
    });

    it("is a function that accepts a 1-indexed position", () => {
      expect(typeof rewriteOneQuizInstructions).toBe("function");
    });

    it("includes the given position number in the output", () => {
      expect(rewriteOneQuizInstructions(3, "ks2")).toMatch(/3/);
    });

    it("tells the LLM to return only the replacement question", () => {
      expect(rewriteOneQuizInstructions(2, "ks2")).toMatch(/only/i);
    });

    it("is distinct from the full-regen instructions", () => {
      expect(rewriteOneQuizInstructions(1, "ks2")).not.toBe(
        starterQuizInstructions("ks2"),
      );
    });

    it("includes key-stage-specific question guidance", () => {
      expect(rewriteOneQuizInstructions(1, "ks2")).toContain(
        "For key stage 1 and 2",
      );
    });
  });
});
