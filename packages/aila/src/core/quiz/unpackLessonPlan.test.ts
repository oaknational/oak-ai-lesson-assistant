import { unpackLessonPlanForPrompt } from "./unpackLessonPlan";

describe("unpackLessonPlanForPrompt", () => {
  it("should format a complete lesson plan correctly", () => {
    const testLessonPlan = {
      title: "Test Lesson",
      subject: "Mathematics",
      keyStage: "KS3",
      topic: "Algebra",
      learningOutcome: "I can solve linear equations",
      learningCycles: [
        "Understanding variables",
        "Solving simple equations",
        "Applying equations to problems",
      ],
      priorKnowledge: ["Basic arithmetic", "Understanding of variables"],
      keyLearningPoints: [
        "Variables represent unknown values",
        "Equations can be solved step by step",
        "Solutions can be verified",
      ],
      misconceptions: [
        {
          misconception: "Variables must be letters",
          description: "Variables can be any symbol",
        },
      ],
      keywords: [
        {
          keyword: "Variable",
          definition: "A letter representing an unknown number",
        },
      ],
      additionalMaterials: "Algebra worksheets and manipulatives",
      basedOn: {
        id: "test-123",
        title: "Algebra Basics",
      },
    };

    const result = unpackLessonPlanForPrompt(testLessonPlan);

    // Check that all sections are present and properly formatted
    expect(result).toContain("Title: Test Lesson");
    expect(result).toContain("Subject: Mathematics");
    expect(result).toContain("Key Stage: KS3");
    expect(result).toContain("Topic: Algebra");
    expect(result).toContain("Learning Outcome: I can solve linear equations");

    // Check learning cycles
    expect(result).toContain("Learning Cycles:");
    expect(result).toContain("1. Understanding variables");
    expect(result).toContain("2. Solving simple equations");
    expect(result).toContain("3. Applying equations to problems");

    // Check prior knowledge
    expect(result).toContain("Prior Knowledge:");
    expect(result).toContain("1. Basic arithmetic");
    expect(result).toContain("2. Understanding of variables");

    // Check key learning points
    expect(result).toContain("Key Learning Points:");
    expect(result).toContain("1. Variables represent unknown values");
    expect(result).toContain("2. Equations can be solved step by step");
    expect(result).toContain("3. Solutions can be verified");

    // Check misconceptions
    expect(result).toContain("Misconceptions:");
    expect(result).toContain("1. Variables must be letters");
    expect(result).toContain("   Description: Variables can be any symbol");

    // Check keywords
    expect(result).toContain("Keywords:");
    expect(result).toContain("1. Variable");
    expect(result).toContain(
      "   Definition: A letter representing an unknown number",
    );

    // Check additional materials
    expect(result).toContain(
      "Additional Materials: Algebra worksheets and manipulatives",
    );

    // Check based on
    expect(result).toContain("Based On: Algebra Basics (ID: test-123)");

    // Check that sections are separated by double newlines
    expect(result).toMatch(/\n\n/);
  });

  it("should handle partial lesson plans correctly", () => {
    const partialLessonPlan = {
      title: "Partial Lesson",
      subject: "Science",
      learningOutcome: "I can identify plant parts",
    };

    const result = unpackLessonPlanForPrompt(partialLessonPlan);

    // Check that only present fields are included
    expect(result).toContain("Title: Partial Lesson");
    expect(result).toContain("Subject: Science");
    expect(result).toContain("Learning Outcome: I can identify plant parts");

    // Check that missing fields are not included
    expect(result).not.toContain("Key Stage:");
    expect(result).not.toContain("Topic:");
    expect(result).not.toContain("Learning Cycles:");
    expect(result).not.toContain("Prior Knowledge:");
    expect(result).not.toContain("Key Learning Points:");
    expect(result).not.toContain("Misconceptions:");
    expect(result).not.toContain("Keywords:");
    expect(result).not.toContain("Additional Materials:");
    expect(result).not.toContain("Based On:");
  });

  it("should handle empty arrays gracefully", () => {
    const lessonPlanWithEmptyArrays = {
      title: "Empty Arrays Test",
      learningCycles: [],
      priorKnowledge: [],
      keyLearningPoints: [],
      misconceptions: [],
      keywords: [],
    };

    const result = unpackLessonPlanForPrompt(lessonPlanWithEmptyArrays);

    expect(result).toContain("Title: Empty Arrays Test");
    expect(result).not.toContain("Learning Cycles:");
    expect(result).not.toContain("Prior Knowledge:");
    expect(result).not.toContain("Key Learning Points:");
    expect(result).not.toContain("Misconceptions:");
    expect(result).not.toContain("Keywords:");
  });
});
