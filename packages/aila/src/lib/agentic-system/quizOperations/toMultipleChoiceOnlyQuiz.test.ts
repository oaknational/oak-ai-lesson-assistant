import type { LatestQuiz, LatestQuizQuestion } from "../../../protocol/schema";
import { toMultipleChoiceOnlyQuiz } from "./toMultipleChoiceOnlyQuiz";

const mcQuestion = (
  overrides: Partial<
    Extract<LatestQuizQuestion, { questionType: "multiple-choice" }>
  > = {},
): LatestQuizQuestion => ({
  questionType: "multiple-choice",
  question: "What is 1+1?",
  hint: null,
  answers: ["2"],
  distractors: ["1", "3"],
  ...overrides,
});

const makeQuiz = (questions: LatestQuizQuestion[]): LatestQuiz => ({
  version: "v3",
  questions,
  imageMetadata: [],
});

describe("toMultipleChoiceOnlyQuiz", () => {
  // A quiz may be missing because the lesson hasn't reached that section yet,
  // or an exemplar lesson lacks it. Missing quizzes should be undefined and
  // not become an empty quiz that would be shown to the LLM as a real example.
  it("returns undefined when there is no quiz", () => {
    expect(toMultipleChoiceOnlyQuiz(undefined)).toBeUndefined();
  });

  it("keeps a conforming quiz's questions unchanged", () => {
    const quiz = makeQuiz([mcQuestion()]);

    expect(toMultipleChoiceOnlyQuiz(quiz)?.questions).toEqual(quiz.questions);
  });

  it("filters out non-multiple-choice questions", () => {
    const quiz = makeQuiz([
      mcQuestion(),
      {
        questionType: "short-answer",
        question: "Name a prime number.",
        hint: null,
        answers: ["2", "3"],
      },
      {
        questionType: "order",
        question: "Order these numbers.",
        hint: null,
        items: ["1", "2", "3"],
      },
    ]);

    expect(toMultipleChoiceOnlyQuiz(quiz)?.questions).toEqual([mcQuestion()]);
  });

  it("keeps only the first correct answer when there are several", () => {
    const quiz = makeQuiz([mcQuestion({ answers: ["2", "two"] })]);

    expect(toMultipleChoiceOnlyQuiz(quiz)?.questions[0]?.answers).toEqual([
      "2",
    ]);
  });

  it("trims distractors to two when there are more", () => {
    const quiz = makeQuiz([mcQuestion({ distractors: ["1", "3", "4", "5"] })]);

    expect(toMultipleChoiceOnlyQuiz(quiz)?.questions[0]?.distractors).toEqual([
      "1",
      "3",
    ]);
  });

  it("preserves imageMetadata", () => {
    const imageMetadata = [
      {
        imageUrl: "https://example.com/image.png",
        attribution: "Example",
        width: 100,
        height: 100,
        aiDescription: "An example image",
      },
    ];
    const quiz: LatestQuiz = { ...makeQuiz([mcQuestion()]), imageMetadata };

    expect(toMultipleChoiceOnlyQuiz(quiz)?.imageMetadata).toEqual(
      imageMetadata,
    );
  });

  // reportId points at a maths pipeline generation report. It should be
  // dropped because the LLM shouldn't see it.
  it("drops reportId", () => {
    const quiz: LatestQuiz = { ...makeQuiz([mcQuestion()]), reportId: "abc" };

    expect(toMultipleChoiceOnlyQuiz(quiz)).not.toHaveProperty("reportId");
  });
});
