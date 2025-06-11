import type { Client } from "@elastic/elasticsearch";
import type { OpenAI } from "openai";

import { QuizSchema } from "../../../protocol/schema";
import { CircleTheoremLesson } from "../fixtures/CircleTheoremsExampleOutput";
import { MLQuizGenerator } from "./MLQuizGenerator";

describe("IntegrationTests", () => {
  let mlQuizGenerator: MLQuizGenerator;

  // Set timeout to 30 seconds for all tests in this block
  jest.setTimeout(30000);

  beforeEach(() => {
    mlQuizGenerator = new MLQuizGenerator();
  });

  it("should generate embedding", async () => {
    const embedding = await mlQuizGenerator.createEmbedding(
      "circle theorems and angles",
    );
    expect(embedding).toBeDefined();
    expect(embedding.length).toBe(768);
  });
});

describe("MLQuizGenerator", () => {
  let mlQuizGenerator: MLQuizGenerator = new MLQuizGenerator();

  // Set timeout to 30 seconds for all tests in this block
  jest.setTimeout(30000);

  it("should generate a starter quiz", async () => {
    const result =
      await mlQuizGenerator.generateMathsStarterQuizPatch(CircleTheoremLesson);
    console.log("starter quiz result", JSON.stringify(result));
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);

    result.forEach((item) => {
      expect(QuizSchema.safeParse(item).success).toBe(true);
    });
  });

  it("should generate an exit quiz", async () => {
    const result =
      await mlQuizGenerator.generateMathsExitQuizPatch(CircleTheoremLesson);
    console.log("exit quiz result", JSON.stringify(result));
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(Array.isArray(result)).toBe(true);
    result.forEach((item) => {
      expect(QuizSchema.safeParse(item).success).toBe(true);
    });
  });

  it("should generate embedding", async () => {
    const embedding = await mlQuizGenerator.createEmbedding(
      "circle theorems and angles",
    );
    expect(embedding).toBeDefined();
    expect(embedding.length).toBe(768);
  });

  it("should generate semantic search queries", async () => {
    const result = await mlQuizGenerator.generateSemanticSearchQueries(
      CircleTheoremLesson,
      "/starterQuiz",
    );

    // Check that we got a valid array of strings
    expect(Array.isArray(result.queries)).toBe(true);
    expect(result.queries.length).toBeGreaterThan(0);
    expect(result.queries.length).toBeLessThanOrEqual(3);

    // Check that each query is a non-empty string
    result.queries.forEach((query) => {
      expect(typeof query).toBe("string");
      expect(query.length).toBeGreaterThan(0);
    });

    // Log the queries for debugging
    console.log("Generated semantic search queries:", result);
  });

  it("should generate semantic search queries with real API call", async () => {
    // This test makes a real API call to OpenAI
    const result = await mlQuizGenerator.generateSemanticSearchQueries(
      CircleTheoremLesson,
      "/starterQuiz",
    );

    // Check that we got a valid array of strings
    expect(Array.isArray(result.queries)).toBe(true);
    expect(result.queries.length).toBeGreaterThan(0);
    expect(result.queries.length).toBeLessThanOrEqual(3);

    // Check that each query is a non-empty string
    result.queries.forEach((query) => {
      expect(typeof query).toBe("string");
      expect(query.length).toBeGreaterThan(0);
    });

    // Log the actual queries for inspection
    console.log("Generated semantic search queries:", result);
  });

  it("should generate quiz questions using semantic search queries", async () => {
    // Set a longer timeout for this test as it makes multiple API calls
    jest.setTimeout(60000); // 60 seconds

    // This test makes real API calls to OpenAI and Elasticsearch
    const result = await mlQuizGenerator.generateMathsQuizMLWithSemanticQueries(
      CircleTheoremLesson,
      "/starterQuiz",
    );

    // Check that we got a valid array of quiz questions
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    // Check that each question has the required properties
    result.forEach((question) => {
      expect(question).toHaveProperty("question");
      expect(question).toHaveProperty("answers");
      expect(question).toHaveProperty("distractors");
      expect(Array.isArray(question.answers)).toBe(true);
      expect(Array.isArray(question.distractors)).toBe(true);
      expect(question.answers.length).toBeGreaterThan(0);
      expect(question.distractors.length).toBeGreaterThan(0);
    });

    // Log the first question for inspection
    if (result[0]) {
      console.log(
        "First generated question:",
        JSON.stringify(result[0], null, 2),
      );
    }
  });

  it("should correctly unpack lesson plan for prompt", () => {
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
          definition: "A symbol representing an unknown value",
        },
      ],
      additionalMaterials: "Graph paper, calculators",
      basedOn: {
        id: "test-123",
        title: "Algebra Basics",
      },
    };

    const result = mlQuizGenerator.unpackLessonPlanForPrompt(testLessonPlan);

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
      "   Definition: A symbol representing an unknown value",
    );

    // Check additional materials
    expect(result).toContain("Additional Materials: Graph paper, calculators");

    // Check based on
    expect(result).toContain("Based On: Algebra Basics (ID: test-123)");

    // Check that sections are separated by double newlines
    expect(result).toMatch(/\n\n/);
  });

  it("should handle partial lesson plan data", () => {
    const partialLessonPlan = {
      title: "Partial Lesson",
      subject: "Science",
      learningOutcome: "I can identify plant parts",
    };

    const result = mlQuizGenerator.unpackLessonPlanForPrompt(partialLessonPlan);

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
});
