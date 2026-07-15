import type { PartialLessonPlan } from "../../../../../protocol/schema";
import { starterQuizDocumentForPrompt } from "./starterQuizDocumentView";

describe("starterQuizDocumentForPrompt", () => {
  it("keeps lesson context fields and prior knowledge only", () => {
    const document: PartialLessonPlan = {
      title: "Comparing fractions",
      subject: "maths",
      keyStage: "ks2",
      topic: "Fractions",
      learningOutcome: "I can compare fractions with the same denominator",
      priorKnowledge: ["Pupils can halve shapes"],
      basedOn: { id: "lesson-1", title: "Fractions of shapes" },
      keyLearningPoints: ["A fraction shows parts of a whole"],
      keywords: [{ keyword: "denominator", definition: "The bottom number" }],
      learningCycles: ["Compare unit fractions"],
      misconceptions: [
        {
          misconception: "Bigger denominators mean bigger fractions",
          description: "Show that 1/8 is smaller than 1/4 using fraction bars.",
        },
      ],
      cycle1: {
        title: "Compare unit fractions",
        durationInMinutes: 10,
        explanation: {
          spokenExplanation: "Explain comparing unit fractions.",
          accompanyingSlideDetails: "Two fraction bars",
          imagePrompt: "fraction bars",
          slideText: "Compare unit fractions",
        },
        checkForUnderstanding: [
          {
            question: "Which is larger, 1/2 or 1/4?",
            answers: ["1/2"],
            distractors: ["1/4", "They are equal"],
          },
          {
            question: "Which is smaller, 1/3 or 1/5?",
            answers: ["1/5"],
            distractors: ["1/3", "They are equal"],
          },
        ],
        practice: "Sort fractions by size.",
        feedback: "1/2 is the largest unit fraction.",
      },
      exitQuiz: { version: "v3", questions: [], imageMetadata: [] },
    };

    expect(starterQuizDocumentForPrompt(document)).toEqual({
      title: "Comparing fractions",
      subject: "maths",
      keyStage: "ks2",
      topic: "Fractions",
      learningOutcome: "I can compare fractions with the same denominator",
      priorKnowledge: ["Pupils can halve shapes"],
    });
  });

  it("handles a sparse document", () => {
    expect(starterQuizDocumentForPrompt({ title: "New lesson" })).toEqual({
      title: "New lesson",
    });
  });
});
