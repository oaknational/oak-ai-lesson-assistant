import type { LessonPlanDocInputData } from "../schema/input.schema";
import { prepLessonPlanForDocs } from "./prepLessonPlanForDocs";

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
  practice: "Practice task",
  feedback: "Feedback text",
});

function makeBaseLessonPlan(
  overrides: Partial<LessonPlanDocInputData> = {},
): LessonPlanDocInputData {
  return {
    title: "Test Lesson",
    subject: "science",
    keyStage: "keyStage3",
    topic: "Forces",
    learningOutcome: "Understand Newton's laws",
    learningCycles: ["Cycle 1 outcome", "Cycle 2 outcome", "Cycle 3 outcome"],
    priorKnowledge: ["Prior knowledge 1"],
    keyLearningPoints: ["KLP 1", "KLP 2", "KLP 3", "KLP 4"],
    misconceptions: [
      { misconception: "Misconception A", description: "Description A" },
      { misconception: "Misconception B", description: "Description B" },
      { misconception: "Misconception C", description: "Description C" },
    ],
    keywords: [
      { keyword: "force", definition: "A push or pull" },
      { keyword: "mass", definition: "Amount of matter" },
    ],
    starterQuiz: makeQuiz(6),
    exitQuiz: makeQuiz(6),
    cycle1: makeCycle("Cycle 1"),
    cycle2: makeCycle("Cycle 2"),
    cycle3: makeCycle("Cycle 3"),
    ...overrides,
  };
}

describe("prepLessonPlanForDocs", () => {
  it("should map top-level lesson metadata", async () => {
    const result = await prepLessonPlanForDocs(makeBaseLessonPlan());

    expect(result.lesson_title).toBe("Test Lesson");
    expect(result.subject).toBe("science");
    expect(result.key_stage).toBe("Key Stage3");
    expect(result.topic).toBe("Forces");
    expect(result.learning_outcome).toBe("Understand Newton's laws");
  });

  describe("misconceptions", () => {
    it("should format three misconceptions with numbered prefixes", async () => {
      const result = await prepLessonPlanForDocs(makeBaseLessonPlan());

      expect(result.misconception_1).toBe("1.     Description A");
      expect(result.misconception_2).toBe("2.     Description B");
      expect(result.misconception_3).toBe("3.     Description C");
    });

    it("should handle a single misconception", async () => {
      const result = await prepLessonPlanForDocs(
        makeBaseLessonPlan({
          misconceptions: [
            { misconception: "Only one", description: "Single description" },
          ],
        }),
      );

      expect(result.misconception_1).toBe("1.     Single description");
      expect(result.misconception_2).toBe("");
      expect(result.misconception_3).toBe("");
    });

    it("should handle null misconceptions", async () => {
      const result = await prepLessonPlanForDocs(
        makeBaseLessonPlan({ misconceptions: null }),
      );

      expect(result.misconception_1).toBe("");
      expect(result.misconception_2).toBe("");
      expect(result.misconception_3).toBe("");
    });
  });

  describe("keyLearningPoints", () => {
    it("should format four key learning points with numbered prefixes", async () => {
      const result = await prepLessonPlanForDocs(makeBaseLessonPlan());

      expect(result.key_learning_point_1).toBe("1.     KLP 1");
      expect(result.key_learning_point_2).toBe("2.     KLP 2");
      expect(result.key_learning_point_3).toBe("3.     KLP 3");
      expect(result.key_learning_point_4).toBe("4.     KLP 4");
    });

    it("should handle a single key learning point", async () => {
      const result = await prepLessonPlanForDocs(
        makeBaseLessonPlan({ keyLearningPoints: ["Only KLP"] }),
      );

      expect(result.key_learning_point_1).toBe("1.     Only KLP");
      expect(result.key_learning_point_2).toBe(" ");
      expect(result.key_learning_point_3).toBe(" ");
      expect(result.key_learning_point_4).toBe(" ");
    });
  });

  describe("learningCycles", () => {
    it("should format three learning cycle outcomes with numbered prefixes", async () => {
      const result = await prepLessonPlanForDocs(makeBaseLessonPlan());

      expect(result.learning_cycle_outcome_1).toBe("1.     Cycle 1 outcome");
      expect(result.learning_cycle_outcome_2).toBe("2.     Cycle 2 outcome");
      expect(result.learning_cycle_outcome_3).toBe("3.     Cycle 3 outcome");
    });

    it("should handle two learning cycles", async () => {
      const result = await prepLessonPlanForDocs(
        makeBaseLessonPlan({
          learningCycles: ["Cycle A", "Cycle B"],
          cycle3: undefined,
        }),
      );

      expect(result.learning_cycle_outcome_1).toBe("1.     Cycle A");
      expect(result.learning_cycle_outcome_2).toBe("2.     Cycle B");
      expect(result.learning_cycle_outcome_3).toBe(" ");
    });
  });

  describe("keywords", () => {
    it("should map keywords and definitions to their slots", async () => {
      const result = await prepLessonPlanForDocs(makeBaseLessonPlan());

      expect(result.keyword_1).toBe("force");
      expect(result.keyword_definition_1).toBe("A push or pull");
      expect(result.keyword_2).toBe("mass");
      expect(result.keyword_definition_2).toBe("Amount of matter");
    });

    it("should handle fewer keywords than slots", async () => {
      const result = await prepLessonPlanForDocs(
        makeBaseLessonPlan({
          keywords: [{ keyword: "energy", definition: "Capacity for work" }],
        }),
      );

      expect(result.keyword_1).toBe("energy");
      expect(result.keyword_definition_1).toBe("Capacity for work");
      expect(result.keyword_2).toBe(" ");
      expect(result.keyword_definition_2).toBe(" ");
    });

    it("should handle null keywords", async () => {
      const result = await prepLessonPlanForDocs(
        makeBaseLessonPlan({ keywords: null }),
      );

      expect(result.keyword_1).toBe(" ");
      expect(result.keyword_2).toBe(" ");
    });
  });

  describe("prior knowledge", () => {
    it("should format prior knowledge as bullet points", async () => {
      const result = await prepLessonPlanForDocs(
        makeBaseLessonPlan({
          priorKnowledge: ["Knows about gravity", "Understands speed"],
        }),
      );

      expect(result.prior_knowledge).toEqual([
        "•  Knows about gravity",
        "•  Understands speed",
      ]);
    });

    it("should handle null prior knowledge", async () => {
      const result = await prepLessonPlanForDocs(
        makeBaseLessonPlan({ priorKnowledge: null }),
      );

      expect(result.prior_knowledge).toEqual([" "]);
    });
  });

  describe("cycles", () => {
    it("should map cycle titles", async () => {
      const result = await prepLessonPlanForDocs(makeBaseLessonPlan());

      expect(result.learning_cycle_1_title).toBe("Cycle 1");
      expect(result.learning_cycle_2_title).toBe("Cycle 2");
      expect(result.learning_cycle_3_title).toBe("Cycle 3");
    });

    it("should handle missing optional cycles", async () => {
      const result = await prepLessonPlanForDocs(
        makeBaseLessonPlan({
          cycle2: undefined,
          cycle3: undefined,
        }),
      );

      expect(result.learning_cycle_2_title).toBe("");
      expect(result.learning_cycle_3_title).toBe("");
      expect(result.cycle_2_practice).toBe(" ");
      expect(result.cycle_2_feedback).toBe(" ");
      expect(result.cycle_3_practice).toBe(" ");
      expect(result.cycle_3_feedback).toBe(" ");
    });
  });

  describe("no field contains the string 'undefined'", () => {
    it("with fully populated data", async () => {
      const result = await prepLessonPlanForDocs(makeBaseLessonPlan());
      assertNoUndefinedStrings(result);
    });

    it("with minimal data", async () => {
      const result = await prepLessonPlanForDocs(
        makeBaseLessonPlan({
          learningCycles: ["Only one"],
          keyLearningPoints: ["Only one"],
          misconceptions: [
            { misconception: "Only one", description: "Only one" },
          ],
          keywords: [{ keyword: "only", definition: "one" }],
          priorKnowledge: ["one thing"],
          cycle2: undefined,
          cycle3: undefined,
        }),
      );
      assertNoUndefinedStrings(result);
    });
  });
});

function assertNoUndefinedStrings(result: Record<string, unknown>) {
  for (const [key, value] of Object.entries(result)) {
    if (typeof value === "string") {
      expect(`${key}: ${value}`).not.toContain("undefined");
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string") {
          expect(`${key}: ${item}`).not.toContain("undefined");
        }
      }
    }
  }
}
