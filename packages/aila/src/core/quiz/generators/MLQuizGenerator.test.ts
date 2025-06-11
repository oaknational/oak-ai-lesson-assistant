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
});
