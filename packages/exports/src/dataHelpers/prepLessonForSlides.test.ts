import type { LessonSlidesInputData } from "../schema/input.schema";
import { prepLessonForSlides } from "./prepLessonForSlides";

const makeQuiz = (questionCount: number) => ({
  version: "v3" as const,
  questions: Array.from({ length: questionCount }, (_, i) => ({
    questionType: "multiple-choice" as const,
    question: `Question ${i + 1}`,
    answers: ["correct"],
    distractors: ["wrong1", "wrong2"],
    hint: null,
  })),
  imageMetadata: [],
});

const makeCycle = (title: string) => ({
  title,
  durationInMinutes: 15,
  explanation: {
    spokenExplanation: `Explanation for ${title}`,
    accompanyingSlideDetails: "Slide details",
    imagePrompt: "Image prompt",
    slideText: "Slide text",
  },
  checkForUnderstanding: [
    { question: "CFU Q1", answers: ["A"], distractors: ["B"] },
    { question: "CFU Q2", answers: ["C"], distractors: ["D"] },
  ],
  practice: "Full practice task with the data table.",
  feedback: "Feedback text",
});

function makeLessonPlan(): LessonSlidesInputData {
  return {
    title: "Test Lesson",
    subject: "science",
    keyStage: "ks3",
    topic: "Forces",
    learningOutcome: "Understand Newton's laws",
    learningCycles: ["Cycle 1 outcome", "Cycle 2 outcome"],
    priorKnowledge: ["Prior knowledge 1"],
    keyLearningPoints: ["KLP 1", "KLP 2", "KLP 3"],
    misconceptions: [
      { misconception: "Misconception A", description: "Description A" },
    ],
    keywords: [{ keyword: "force", definition: "A push or pull" }],
    starterQuiz: makeQuiz(6),
    exitQuiz: makeQuiz(6),
    cycle1: makeCycle("Cycle 1"),
    cycle2: makeCycle("Cycle 2"),
    cycle3: null,
  };
}

describe("prepLessonForSlides practice slide text", () => {
  it("uses the slide version when present", async () => {
    const lessonPlan = makeLessonPlan();
    lessonPlan.cycle1.practiceSlideText =
      "Trimmed task. You will find the data table on the worksheet.";

    const result = await prepLessonForSlides(lessonPlan);

    expect(result.learning_cycle_1_practise).toBe(
      "Trimmed task. You will find the data table on the worksheet.",
    );
  });

  it("fills the stimulus slide placeholder when the composer produced one", async () => {
    const lessonPlan = makeLessonPlan();
    lessonPlan.cycle1.practiceStimulusSlideText = "For step 1:\nTime 0 20 40";

    const result = await prepLessonForSlides(lessonPlan);

    expect(result.learning_cycle_1_practise_stimulus).toBe(
      "For step 1:\nTime 0 20 40",
    );
    expect(result.learning_cycle_2_practise_stimulus).toBe("");
  });

  it("falls back to the full practice text when absent (older lessons)", async () => {
    const result = await prepLessonForSlides(makeLessonPlan());

    expect(result.learning_cycle_1_practise).toBe(
      "Full practice task with the data table.",
    );
    expect(result.learning_cycle_2_practise).toBe(
      "Full practice task with the data table.",
    );
  });
});
