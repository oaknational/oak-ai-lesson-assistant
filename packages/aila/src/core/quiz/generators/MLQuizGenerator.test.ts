import type { Client } from "@elastic/elasticsearch";
import type { OpenAI } from "openai";

import { QuizV3QuestionSchema } from "../../../protocol/schemas/quiz/quizV3";
import { CircleTheoremLesson } from "../fixtures/CircleTheoremsExampleOutput";
import { createMockTask } from "../instrumentation";
import { MLQuizGenerator } from "./MLQuizGenerator";

describe("MLQuizGenerator", () => {
  let mlQuizGenerator: MLQuizGenerator = new MLQuizGenerator();

  // Set timeout to 30 seconds for all tests in this block
  jest.setTimeout(30000);

  it("should generate a starter quiz", async () => {
    const task = createMockTask();
    const result = await mlQuizGenerator.generateMathsStarterQuizCandidates(
      CircleTheoremLesson,
      [],
      task,
    );
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);

    result.forEach((pool) => {
      pool.questions.forEach((item) => {
        expect(QuizV3QuestionSchema.safeParse(item.question).success).toBe(
          true,
        );
      });
    });
  });

  it("should generate an exit quiz", async () => {
    const task = createMockTask();
    const result = await mlQuizGenerator.generateMathsExitQuizCandidates(
      CircleTheoremLesson,
      [],
      task,
    );
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(Array.isArray(result)).toBe(true);
    result.forEach((pool) => {
      pool.questions.forEach((item) => {
        expect(QuizV3QuestionSchema.safeParse(item.question).success).toBe(
          true,
        );
      });
    });
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
  });

  it("should generate quiz questions using semantic search queries", async () => {
    // Set a longer timeout for this test as it makes multiple API calls
    jest.setTimeout(60000); // 60 seconds

    // This test makes real API calls to OpenAI and Elasticsearch
    const task = createMockTask();
    const result = await mlQuizGenerator.generateMathsQuizML(
      CircleTheoremLesson,
      "/starterQuiz",
      task,
    );

    // Check that we got a valid array of quiz questions
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    // Check that each question has the required properties
    result.forEach((ragQuestion) => {
      expect(ragQuestion).toBeDefined();
      expect(ragQuestion).toHaveProperty("question");
      expect(ragQuestion).toHaveProperty("sourceUid");
      expect(ragQuestion).toHaveProperty("source");
      expect(ragQuestion.question).toHaveProperty("questionType");
      expect(ragQuestion.question).toHaveProperty("question");
    });
  });
});
