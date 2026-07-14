import { exitQuizInstructions } from "./exitQuiz.instructions";

describe("exitQuiz instructions", () => {
  describe("exitQuizInstructions", () => {
    it("asks for exactly 6 questions", () => {
      expect(exitQuizInstructions("ks2")).toMatch(/exactly 6 questions/i);
    });

    it("asks for exactly 1 correct answer and exactly 2 distractors", () => {
      expect(exitQuizInstructions("ks2")).toMatch(/exactly 1 correct answer/i);
      expect(exitQuizInstructions("ks2")).toMatch(
        /exactly 2 high-quality distractors/i,
      );
    });
  });
});
