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
      keyLearningPoints: ["A fraction shows parts of a whole"],
      keywords: [{ keyword: "denominator", definition: "The bottom number" }],
      learningCycles: ["Compare unit fractions"],
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
