import type { LatestQuiz, LatestQuizQuestion } from "../../../protocol/schema";
import type { StructuralItemIntent } from "../schema";
import { quizOperationDispatcher } from "./quizOperationDispatcher";
import type { RunSingleQuestionFn } from "./quizOperationDispatcher";

const makeQuestion = (text: string): LatestQuizQuestion => ({
  questionType: "multiple-choice",
  question: text,
  hint: null,
  answers: ["Correct answer"],
  distractors: ["Wrong A", "Wrong B"],
});

const makeQuiz = (questions: LatestQuizQuestion[]): LatestQuiz => ({
  version: "v3",
  questions,
  imageMetadata: [],
});

const noAgent: RunSingleQuestionFn = jest.fn();

const q1 = makeQuestion("What is 1+1?");
const q2 = makeQuestion("What colour is the sky?");
const q3 = makeQuestion("How many sides does a triangle have?");

describe("quizOperationDispatcher", () => {
  describe("REMOVE_ITEM", () => {
    const intent = (position: number | null): StructuralItemIntent => ({
      action: "REMOVE_ITEM",
      position,
    });

    it("removes the question at the given 1-indexed position", async () => {
      const quiz = makeQuiz([q1, q2, q3]);
      const result = await quizOperationDispatcher(quiz, intent(2), noAgent);

      expect(result.data.questions).toEqual([q1, q3]);
      expect(result.note).toBeUndefined();
    });

    it("returns the quiz unchanged with a note when position is null", async () => {
      const quiz = makeQuiz([q1, q2, q3]);
      const result = await quizOperationDispatcher(quiz, intent(null), noAgent);

      expect(result.data).toBe(quiz);
      expect(result.note).toMatch(/remove/i);
    });

    it("returns the quiz unchanged with a note when position is below range", async () => {
      const quiz = makeQuiz([q1, q2]);
      const result = await quizOperationDispatcher(quiz, intent(0), noAgent);

      expect(result.data).toBe(quiz);
      expect(result.note).toContain("2");
    });

    it("returns the quiz unchanged with a note when position is above range", async () => {
      const quiz = makeQuiz([q1, q2]);
      const result = await quizOperationDispatcher(quiz, intent(5), noAgent);

      expect(result.data).toBe(quiz);
      expect(result.note).toContain("5");
      expect(result.note).toContain("2");
    });

    it("does not call the agent", async () => {
      const quiz = makeQuiz([q1, q2]);
      const agent = jest.fn() as jest.MockedFunction<RunSingleQuestionFn>;
      await quizOperationDispatcher(quiz, intent(1), agent);

      expect(agent).not.toHaveBeenCalled();
    });
  });

  describe("ADD_ITEM", () => {
    const intent = (position: number | null = null): StructuralItemIntent => ({
      action: "ADD_ITEM",
      position,
    });

    it("appends the new question at the end when no position is given", async () => {
      const quiz = makeQuiz([q1, q2]);
      const newQ = makeQuestion("What is half of 10?");
      const agent = jest.fn().mockResolvedValue(newQ);

      const result = await quizOperationDispatcher(quiz, intent(null), agent);

      expect(result.data.questions).toEqual([q1, q2, newQ]);
      expect(result.note).toBeUndefined();
    });

    it("inserts the new question at the given 1-indexed position", async () => {
      const quiz = makeQuiz([q1, q2]);
      const newQ = makeQuestion("Inserted question");
      const agent = jest.fn().mockResolvedValue(newQ);

      const result = await quizOperationDispatcher(quiz, intent(1), agent);

      expect(result.data.questions).toEqual([newQ, q1, q2]);
    });

    it("invokes the single-question callback exactly once", async () => {
      const quiz = makeQuiz([q1]);
      const agent = jest.fn().mockResolvedValue(makeQuestion("New"));

      await quizOperationDispatcher(quiz, intent(), agent);

      expect(agent).toHaveBeenCalledTimes(1);
    });

    it("returns the quiz unchanged with a note when the agent returns null", async () => {
      const quiz = makeQuiz([q1, q2]);
      const agent = jest.fn().mockResolvedValue(null);

      const result = await quizOperationDispatcher(quiz, intent(), agent);

      expect(result.data).toBe(quiz);
      expect(result.note).toMatch(/trouble adding/i);
    });
    it("returns the quiz unchanged with a note when position is out of range", async () => {
      const quiz = makeQuiz([q1, q2]);
      const agent = jest.fn().mockResolvedValue(null);

      const result = await quizOperationDispatcher(quiz, intent(0), agent);

      expect(result.data).toBe(quiz);
      expect(result.note).toMatch(/valid positions/i);
    });
  });

  describe("CHANGE_ITEM", () => {
    const intent = (position: number | null): StructuralItemIntent => ({
      action: "CHANGE_ITEM",
      position,
    });

    it("replaces the question at the given 1-indexed position", async () => {
      const quiz = makeQuiz([q1, q2, q3]);
      const replacement = makeQuestion("Harder version of Q2");
      const agent = jest.fn().mockResolvedValue(replacement);

      const result = await quizOperationDispatcher(quiz, intent(2), agent);

      expect(result.data.questions).toEqual([q1, replacement, q3]);
      expect(result.note).toBeUndefined();
    });

    it("invokes the single-question callback exactly once for a valid position", async () => {
      const quiz = makeQuiz([q1, q2, q3]);
      const agent = jest.fn().mockResolvedValue(makeQuestion("New Q3"));

      await quizOperationDispatcher(quiz, intent(3), agent);

      expect(agent).toHaveBeenCalledTimes(1);
    });

    it("returns the quiz unchanged with a note when position is null", async () => {
      const quiz = makeQuiz([q1, q2]);
      const agent = jest.fn().mockResolvedValue(makeQuestion("x"));

      const result = await quizOperationDispatcher(quiz, intent(null), agent);

      expect(result.data).toBe(quiz);
      expect(result.note).toMatch(/change/i);
      expect(agent).not.toHaveBeenCalled();
    });

    it("returns the quiz unchanged with a note when position is out of range", async () => {
      const quiz = makeQuiz([q1, q2]);
      const agent = jest.fn().mockResolvedValue(makeQuestion("x"));

      const result = await quizOperationDispatcher(quiz, intent(5), agent);

      expect(result.data).toBe(quiz);
      expect(result.note).toContain("5");
      expect(result.note).toContain("2");
      expect(agent).not.toHaveBeenCalled();
    });

    it("returns the quiz unchanged with a note when the agent returns null", async () => {
      const quiz = makeQuiz([q1, q2]);
      const agent = jest.fn().mockResolvedValue(null);

      const result = await quizOperationDispatcher(quiz, intent(1), agent);

      expect(result.data).toBe(quiz);
      expect(result.note).toMatch(/trouble rewriting/i);
    });
  });
});
